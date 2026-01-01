import { useCallback, useState } from "react";

type UseControllableStateParams<T> = {
	prop?: T;
	defaultProp?: T;
	onChange?: (state: T) => void;
};

export function useControllableState<T>({
	prop,
	defaultProp,
	onChange = () => {},
}: UseControllableStateParams<T>) {
	const [uncontrolledProp, setUncontrolledProp] = useState<T | undefined>(
		defaultProp,
	);
	const isControlled = prop !== undefined;

	const value = isControlled ? prop : uncontrolledProp;

	const setValue = useCallback(
		(nextValue: T) => {
			if (isControlled) {
				onChange(nextValue);
			} else {
				setUncontrolledProp(nextValue);
				onChange(nextValue);
			}
		},
		[isControlled, onChange],
	);

	return [value, setValue] as const;
}
