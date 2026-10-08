import { MAX_USERS, MIN_USERS } from "@/lib/leads";

interface UsersInputProps {
  /** What's typed in the box, kept as text so it can be empty mid-edit. */
  value: string;
  /** The parsed user count, or null when the value is empty or out of range. */
  users: number | null;
  onChange: (value: string) => void;
}

export default function UsersInput({ value, users, onChange }: UsersInputProps) {
  const invalid = users === null;
  return (
    <>
      <h3>
        <label htmlFor="users-input">2. How many users?</label>
      </h3>
      <div className="users-container">
        <input
          id="users-input"
          type="number"
          inputMode="numeric"
          min={MIN_USERS}
          max={MAX_USERS}
          step={1}
          placeholder="Enter number of users"
          className="users-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={invalid}
          aria-describedby={invalid ? "users-error" : undefined}
        />
        {invalid && (
          <p id="users-error" className="field-error">
            Enter a whole number from {MIN_USERS} to {MAX_USERS}.
          </p>
        )}
      </div>
    </>
  );
}
