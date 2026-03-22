export const sendGAEvent = ({ action, category, label, value, ...rest }: {
    action: string;
    category: string;
    label?: string;
    value?: number;
    [key: string]: any;
}) => {
    if (typeof window !== "undefined" && (window as any).dataLayer) {
        (window as any).dataLayer.push({
            event: action,
            event_category: category,
            event_label: label,
            value: value,
            ...rest
        });
    } else {
        console.log("GA4 Event:", { action, category, label, value, ...rest });
    }
};
