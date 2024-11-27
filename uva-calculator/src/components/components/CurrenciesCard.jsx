import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CurrenciesCard({
    title = "Currency Card",
    usdPrice = null,
    arsPrice = null,
    uvaPrice = null
}){
    const itemPadding = "py-2 px-4";

    return (
        <Card className="w-full min-w-sm mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-semibold text-center my-2">{title}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
                {usdPrice && (
                    <div className={`flex items-center justify-between ${itemPadding} bg-slate-900/50 rounded-lg`}>
                        <span className="text-sm font-medium">US Dollars</span>
                        <div className="text-right">
                            <span className="text-lg font-bold">U$D {usdPrice}</span>
                            <span className="sr-only">US Dollars</span>
                        </div>
                    </div>
                )}
                {arsPrice && (
                    <div className={`flex items-center justify-between ${itemPadding} bg-slate-900/50 rounded-lg`}>
                        <span className="text-sm font-medium">Argentine Pesos</span>
                        <div className="text-right">
                            <span className="text-lg font-bold">AR$ {arsPrice}</span>
                            <span className="sr-only">Argentine Pesos</span>
                        </div>
                    </div>
                )}
                {uvaPrice && (
                    <div className={`flex items-center justify-between ${itemPadding} bg-slate-900/50 rounded-lg`}>
                        <span className="text-sm font-medium">UVAs</span>
                        <div className="text-right">
                            <span className="text-lg font-bold">{uvaPrice} UVA</span>
                            <span className="sr-only">UVAs</span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}