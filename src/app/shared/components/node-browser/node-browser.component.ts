import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { IBreadcrumbLink, IModalDialog } from 'gentics-ui-core';
import * as esGqlQuery from 'raw-loader!./es-query.gql';
import * as gqlQuery from 'raw-loader!./query.gql';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, flatMap, map, share, skip, take } from 'rxjs/operators';

import { notNullOrUndefined } from '../../../common/util/util';
import { ApiService } from '../../../core/providers/api/api.service';
import { ApplicationStateService } from '../../../state/providers/application-state.service';

import { NodeBrowserOptions, PageResult, QueryResult } from './interfaces';

interface QueryParams {
    parent?: string;
    esQuery?: string;
    page: number;
}

/**
 * A browser that allows selecting nodes.
 *
 * It can be used for single or multiple selection
 * and limit the type of the allowed selection.
 *
 * TODO: Currently the language for the children query is hardcoded.
 * Remove when https://github.com/gentics/mesh/issues/499 is solved.
 *
 */
@Component({
    selector: 'mesh-node-browser',
    templateUrl: './node-browser.tpl.html',
    styleUrls: ['./node-browser.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NodeBrowserComponent implements IModalDialog, OnInit {
    constructor(private apiService: ApiService, private state: ApplicationStateService) {}

    @Input() options: NodeBrowserOptions;
    selectableFn: (node: any) => boolean;
    closableFn: () => boolean;

    currentNode: { uuid: string };
    currentNode$: Subject<string>;
    search: Subject<string | null> = new BehaviorSubject(null);
    queryParams: Subject<QueryParams>;
    searchQuery: string;
    searchedTerm: string;

    queryResult$: Observable<QueryResult>;
    currentPageContent$: Observable<any[]>;
    breadcrumb$: Observable<IBreadcrumbLink[]>;
    totalItems$: Observable<number>;
    pageCount$: Observable<number>;
    currentPage$: Observable<number>;
    searchAvailable$: Observable<boolean>;

    closeFn(uuids: PageResult[] | string[]): void {}
    cancelFn(val?: any): void {}

    selected: PageResult[] = [];

    readonly perPage = 10;

    registerCloseFn(close: (val: any) => void): void {
        this.closeFn = close;
    }

    registerCancelFn(cancel: (val: any) => void): void {
        this.cancelFn = cancel;
    }

    ngOnInit(): void {
        this.initSelectableFn();
        this.currentNode$ = new BehaviorSubject(this.options.startNodeUuid);
        this.searchAvailable$ = this.state.select(s => s.ui.searchAvailable);

        this.queryParams = new BehaviorSubject({
            page: 1
        });

        this.currentPage$ = this.queryParams.pipe(map(params => params.page));

        const esQuery = this.search.pipe(
            map(term =>
                term
                    ? {
                          query: {
                              query_string: {
                                  query: term
                              }
                          }
                      }
                    : null
            )
        );

        // Empty search box when folder is changed and set page to 1
        this.currentNode$.subscribe(parent => {
            this.searchQuery = '';
            this.searchedTerm = '';
            this.queryParams.next({
                parent,
                page: 1
            });
        });

        // Start search when search was pressed
        esQuery.pipe(skip(1)).subscribe(query => {
            this.queryParams.pipe(take(1)).subscribe(prevParams => {
                this.queryParams.next({
                    parent: prevParams.parent,
                    esQuery: query ? JSON.stringify(query) : undefined,
                    page: 1
                });
            });
        });

        // Fetch nodes from Mesh when folder, page or search term has changed
        this.queryResult$ = this.queryParams.pipe(
            flatMap(queryParams =>
                this.apiService.graphQL(
                    { project: this.options.projectName },
                    {
                        query: queryParams.esQuery ? esGqlQuery : gqlQuery,
                        variables: {
                            query: queryParams.esQuery,
                            filter: this.options.nodeFilter,
                            parent: queryParams.parent,
                            perPage: this.perPage,
                            page: queryParams.page
                        }
                    }
                )
            ),
            map(response => response.data.node || response.data),
            filter(notNullOrUndefined),
            share()
        ) as Observable<QueryResult>;

        this.currentPageContent$ = this.queryResult$.pipe(map(result => result.nodes.elements));
        this.breadcrumb$ = this.queryResult$.pipe(
            filter(result => !!result.breadcrumb),
            map(result => this.toBreadcrumb(result))
        );
        this.totalItems$ = this.queryResult$.pipe(map(result => result.nodes.totalCount));
        this.pageCount$ = this.queryResult$.pipe(map(result => result.nodes.pageCount));
        this.queryResult$.subscribe(result => (this.currentNode = result));
    }

    private initSelectableFn() {
        if (this.options.chooseContainer) {
            // Checkboxes are hidden when a container is chosen
            this.selectableFn = () => false;
            const selectableFn = this.options.selectablePredicate;
            // TODO Use a seperate function for that
            // Use the selectable function for the button in container mode
            this.closableFn =
                (selectableFn && (() => (this.currentNode && selectableFn(this.currentNode as any)) || false)) ||
                (() => true);
        } else if (this.options.selectablePredicate) {
            this.selectableFn = this.options.selectablePredicate;
            this.closableFn = () => this.selected.length > 0;
        } else {
            // By default everything can be chosen
            this.selectableFn = () => true;
            this.closableFn = () => this.selected.length > 0;
        }
    }

    toBreadcrumb(result: QueryResult): IBreadcrumbLink[] {
        const breadcrumbs = result.breadcrumb!;

        return breadcrumbs.map((crumb, index) => {
            if (index === 0) {
                crumb.text = this.options.projectName;
            }
            if (!crumb.text) {
                crumb.text = crumb.uuid;
            }
            return crumb;
        });
    }

    submitClicked() {
        if (this.options.chooseContainer) {
            this.currentNode$.pipe(take(1)).subscribe(uuid => this.closeFn([uuid]));
        } else {
            this.closeFn(this.selected.map(item => item.uuid));
        }
    }

    clearSearch() {
        this.searchQuery = '';
        this.searchedTerm = '';
        this.search.next(null);
    }

    onSearch(query: string) {
        this.search.next(query);
        this.searchedTerm = query;
        this.searchQuery = '';
    }

    pageChanged(page: number) {
        this.queryParams.pipe(take(1)).subscribe(prevParams => {
            this.queryParams.next({ ...prevParams, page });
        });
    }
}
