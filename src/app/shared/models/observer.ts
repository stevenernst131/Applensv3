export interface ObserverSiteResponse {
    SiteName: string;
    Details: ObserverSiteInfo[];
}

export interface ObserverSiteInfo {
    SiteName: string;
    StampName: string;
    InternalStampName: string;
    Subscription: string;
    WebSpace: string;
    ResourceGroupName: string;
    SlotName: string;
}