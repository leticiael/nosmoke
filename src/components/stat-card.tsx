import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Gift, Target, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: "xp" | "gift" | "target" | "flame";
  progress?: number;
  variant?: "default" | "success" | "warning" | "danger";
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  progress,
  variant = "default",
}: StatCardProps) {
  const iconMap = {
    xp: Sparkles,
    gift: Gift,
    target: Target,
    flame: Flame,
  };

  const Icon = icon ? iconMap[icon] : null;

  const variantStyles = {
    default: "bg-white",
    success: "bg-green-50 border-green-200",
    warning: "bg-amber-50 border-amber-200",
    danger: "bg-red-50 border-red-200",
  };

  const textStyles = {
    default: "text-foreground",
    success: "text-green-700",
    warning: "text-amber-700",
    danger: "text-red-700",
  };

  return (
    <Card className={cn("transition-all", variantStyles[variant])}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={cn("text-3xl font-bold", textStyles[variant])}>
              {value}
            </p>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {Icon && (
            <div
              className={cn(
                "rounded-full p-2",
                variant === "default" && "bg-primary/10 text-primary",
                variant === "success" && "bg-green-100 text-green-600",
                variant === "warning" && "bg-amber-100 text-amber-600",
                variant === "danger" && "bg-red-100 text-red-600",
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
        {progress !== undefined && (
          <div className="mt-4">
            <Progress
              value={progress}
              className="h-2"
              indicatorClassName={cn(
                variant === "success" && "bg-green-500",
                variant === "warning" && "bg-amber-500",
                variant === "danger" && "bg-red-500",
              )}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
