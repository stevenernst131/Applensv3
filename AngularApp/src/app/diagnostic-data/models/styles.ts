import { DetectorStatus } from "./detector";

export class StatusStyles {
    public static Critical: string = "#ff0000";
    public static Warning: string = "#ff9104";
    public static Healthy: string = "#3da907";
    public static Info: string = "#3a9bc7";

    public static CriticalIcon: string = "fa-exclamation-circle";
    public static WarningIcon: string = "fa-exclamation-triangle";
    public static HealthyIcon: string = "fa-check-circle";
    public static InfoIcon: string = "fa-info-circle";

    public static getColorByStatus(status: DetectorStatus) {
        switch (status) {
            case DetectorStatus.Critical:
                return StatusStyles.Critical;
            case DetectorStatus.Warning:
                return StatusStyles.Warning;
            case DetectorStatus.Healthy:
                return StatusStyles.Healthy;
            case DetectorStatus.Info:
                return StatusStyles.Info;
            default:
                return '';
        }
    }

    public static getIconByStatus(status: DetectorStatus) {
        switch (status) {
            case DetectorStatus.Critical:
                return StatusStyles.CriticalIcon;
            case DetectorStatus.Warning:
                return StatusStyles.WarningIcon;
            case DetectorStatus.Healthy:
                return StatusStyles.HealthyIcon;
            case DetectorStatus.Info:
                return StatusStyles.InfoIcon;
            default:
                return '';
        }
    }
}