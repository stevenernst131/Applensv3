export interface ObserverSiteResponse {
    siteName: string;
    details: ObserverSiteInfo[];
}

export interface ObserverSiteInfo {
    SiteName: string;
    StampName: string;
    InternalStampName: string;
    Subscription: string;
    WebSpace: string;
    ResourceGroupName: string;
}