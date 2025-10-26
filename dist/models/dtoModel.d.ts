export interface CsProperty {
    name: string;
    type: string;
    isNullable: boolean;
}
export interface CsClass {
    name: string;
    namespace?: string | undefined;
    properties: CsProperty[];
    nestedClasses?: CsClass[] | undefined;
}
export interface CsEnum {
    name: string;
    members: string[];
}
export interface ParseResult {
    classes: CsClass[];
    enums: CsEnum[];
}
export interface CsProperty {
    name: string;
    type: string;
    isNullable: boolean;
}
export interface CsClass {
    name: string;
    namespace?: string | undefined;
    properties: CsProperty[];
    nestedClasses?: CsClass[] | undefined;
}
export interface CsEnum {
    name: string;
    members: string[];
}
export interface ParseResult {
    classes: CsClass[];
    enums: CsEnum[];
}
//# sourceMappingURL=dtoModel.d.ts.map