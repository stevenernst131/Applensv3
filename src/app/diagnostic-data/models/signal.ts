
export interface SignalResponse {
    data: DiagnosticData[];
    metaData: SignalMetaData;
}

export interface DiagnosticData {
    dataTable: DataTableResponseObject;
    renderingProperties: RenderingProperties;
}

export interface RenderingProperties {
    signalGraphType: SignalGraphType;
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
    displayName: string;
    description: string;
}

export enum SignalGraphType {
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