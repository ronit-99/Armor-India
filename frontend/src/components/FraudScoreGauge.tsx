import { cn, fraudScoreColor, fraudScoreBg } from "@/lib/utils";

interface FraudScoreGaugeProps {
  score: number;
  label?: string;
  size?: "sm" | "lg";
}

export function FraudScoreGauge({ score, label = "Fraud Score", size = "lg" }: FraudScoreGaugeProps) {
  const radius = size === "lg" ? 70 : 45;
  const stroke = size === "lg" ? 10 : 7;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;
  const dim = (radius + stroke) * 2;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="transform -rotate-90">
          <circle
            stroke="#1f2937"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            className={cn("transition-all duration-1000", fraudScoreBg(score).replace("bg-", "stroke-"))}
            fill="transparent"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset: offset }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-bold", fraudScoreColor(score), size === "lg" ? "text-3xl" : "text-xl")}>
            {score}%
          </span>
          {score >= 80 && (
            <span className="text-xs text-red-400 font-medium mt-0.5">ALERT</span>
          )}
        </div>
      </div>
      <p className="text-sm text-gray-400 mt-2">{label}</p>
    </div>
  );
}
