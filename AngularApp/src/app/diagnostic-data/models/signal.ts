
export interface ArmObject {
    id: string;
    name: string;
    type: string;
}

export interface SignalResponse {
    dataset: DiagnosticData[];
    metadata: SignalMetaData;
}

export interface DiagnosticData {
    table: DataTableResponseObject;
    renderingProperties: RenderingProperties;
}

export interface RenderingProperties {
    renderingType: RenderingType;
}

export interface DataTableResponseObject {
    tableName: string;
    columns: DataTableResponseColumn[];
    rows: string[][];
}

export interface DataTableResponseColumn {
    columnName: string;
    dataType: string;
    columnType: string;
}

export interface SignalMetaData {
    id: string;
    name: string;
    description: string;
}

export enum RenderingType {
    NoGraph = 0,
    Table,
    TimeSeries
}

export class DataTableDataType {
    static Boolean: string = "Boolean";
    static Byte: string = "Byte";
    static DateTime: string = "DateTime";
    static Double: string = "Double";
    static Int16: string = "Int16";
    static Int32: string = "Int32";
    static Int64: string = "Int64";
    static String: string = "String";

    static NumberTypes: string[] = [ DataTableDataType.Double, DataTableDataType.Int64, DataTableDataType.Int32, DataTableDataType.Int16 ];
}