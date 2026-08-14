interface Rule {
  label: string;
  test: (pw: string) => boolean;
}

const rules: Rule[] = [
  { label: "At least 8 characters", test: (pw) => pw.length >= 8 },
  { label: "One uppercase letter", test: (pw) => /[A-Z]/.test(pw) },
  { label: "One lowercase letter", test: (pw) => /[a-z]/.test(pw) },
  { label: "One number", test: (pw) => /\d/.test(pw) },
  { label: "One special character", test: (pw) => /[!@#$%^&*(),.?":{}|<>_\-[\]\\/~`+=;']/.test(pw) },
];

export function isPasswordStrong(password: string): boolean {
  return rules.every((r) => r.test(password));
}

export default function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  const passedCount = rules.filter((r) => r.test(password)).length;
  const percent = (passedCount / rules.length) * 100;

  const color =
    passedCount <= 2 ? "bg-red-500" : passedCount <= 4 ? "bg-amber-500" : "bg-green-500";
  const label = passedCount <= 2 ? "Weak" : passedCount <= 4 ? "Fair" : "Strong";

  return (
    <div className="mt-1.5">
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-300`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-xs text-body">{label}</span>
      </div>
      <ul className="mt-1.5 space-y-0.5">
        {rules.map((rule) => {
          const passed = rule.test(password);
          return (
            <li key={rule.label} className={`text-xs ${passed ? "text-green-600" : "text-body/60"}`}>
              {passed ? "✓" : "○"} {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
