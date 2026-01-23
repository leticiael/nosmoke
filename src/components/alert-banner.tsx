import { AlertTriangle, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AlertBannerProps {
  type: "over-limit" | "over-30-percent";
  value?: number;
  average?: number;
}

export function AlertBanner({ type, value, average }: AlertBannerProps) {
  if (type === "over-limit") {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="flex items-center gap-3 p-4">
          <AlertTriangle className="h-6 w-6 text-red-600 shrink-0" />
          <div>
            <p className="font-medium text-red-800">
              Limite diário ultrapassado
            </p>
            <p className="text-sm text-red-600">
              Você já consumiu mais de 3,5 cigarros hoje.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardContent className="flex items-center gap-3 p-4">
        <TrendingUp className="h-6 w-6 text-amber-600 shrink-0" />
        <div>
          <p className="font-medium text-amber-800">
            Consumo 30% acima da média
          </p>
          <p className="text-sm text-amber-600">
            Hoje: {value?.toFixed(1).replace(".", ",")} | Média 7 dias:{" "}
            {average?.toFixed(1).replace(".", ",")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
