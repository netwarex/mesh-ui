import { PaginationConfig } from './common-state-models';

export interface ProjectAssignments {
    [projectUuid: string]: boolean;
}

export interface SchemaAssignments {
    [schemaUuid: string]: boolean;
}

export interface AdminSchemasState {
    loadCount: number;
    /** Assignment of the currently open (micro-)schema to projects. */
    assignedToProject: ProjectAssignments;
    schemaList: string[];
    schemaDetail: string | null;
    microschemaList: string[];
    microschemaDetail: string | null;

    pagination: PaginationConfig;
    filterTerm: string;
}
