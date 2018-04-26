import { InsightStatus } from "./insight";

export interface ArmObject {
    id: string;
    name: string;
    type: string;
}

export interface DetectorResponse {
    dataset: DiagnosticData[];
    metadata: DetectorMetaData;
}

export interface DiagnosticData {
    table: DataTableResponseObject;
    renderingProperties: any; // This is any so that we can correctly case it depending on rendering type
}

export interface DataTableResponseObject {
    //tableName: string;
    columns: DataTableResponseColumn[];
    rows: string[][];
}

export interface DataTableResponseColumn {
    columnName: string;
    dataType: string;
    columnType: string;
}

export interface DetectorMetaData {
    id: string;
    name: string;
    description: string;
}

export enum RenderingType {
    NoGraph = 0,
    Table,
    TimeSeries,
    TimeSeriesPerInstance,
    PieChart,
    DataSummary,
    Email,
    Insights,
    DynamicInsight
}

export enum TimeSeriesType {
    LineGraph = 0,
    BarGraph,
    StackedAreaGraph,
    StackedBarGraph
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

export interface Rendering {
    type: RenderingType;
    title: string;
    description: string;
}

export interface DataTableRendering extends Rendering {
    groupByColumnName: string;
    displayColumnNames: string[];
}

export interface TimeSeriesRendering extends Rendering {
    defaultValue: number;
    graphType: TimeSeriesType;
    timestampColumnName: string;
    counterColumnName: string;
    seriesColumns: string[];
}

export interface TimeSeriesPerInstanceRendering extends Rendering {
    graphType: TimeSeriesType;
    timestampColumnName: string;
    roleInstanceColumnName: string;
    counterColumnName: string;
    valueColumnName: string;
    instanceFilter: string[];
    counterNameFilter: string[];
    selectedInstance: string;
}

export interface InsightsRendering extends Rendering {
    insightColumnName: string;
    statusColumnName: string;
    nameColumnName: string;
    valueColumnName: string;
    typeColumnName: string;
}

export interface DynamicInsightRendering extends Rendering {
    status: InsightStatus,
    innerRendering: Rendering,
    expanded: boolean
}