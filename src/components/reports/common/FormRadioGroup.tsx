import {
  Controller,
  useFormContext,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

type Option = string | { value: string; label: string };

type FormRadioGroupProps<T extends FieldValues> = {
  name: FieldPath<T>;
  options: Option[];
  className?: string;
};

// Radio list bound to a string field of the surrounding FormProvider.
// An empty value ("") leaves every option unchecked.
export function FormRadioGroup<T extends FieldValues>({
  name,
  options,
  className,
}: FormRadioGroupProps<T>) {
  const { control } = useFormContext<T>();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <RadioGroup
          ref={field.ref}
          name={field.name}
          value={field.value ?? ""}
          onValueChange={field.onChange}
          className={cn("flex flex-wrap items-center gap-4", className)}
        >
          {options.map((option) => {
            const { value, label } =
              typeof option === "string" ? { value: option, label: option } : option;
            return (
              <label key={value} className="flex items-center gap-2">
                <RadioGroupItem value={value} />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {label}
                </span>
              </label>
            );
          })}
        </RadioGroup>
      )}
    />
  );
}
