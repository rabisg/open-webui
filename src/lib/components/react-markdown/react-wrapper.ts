import React from 'react';
import ReactDOM from 'react-dom/client';

interface ReactWrapper {
	render(container: HTMLElement): void;
	updateProps(newProps: any): void;
	unmount(): void;
}

export function createReactWrapper(
	Component: React.ComponentType<any>,
	initialProps: any
): ReactWrapper {
	let root: ReactDOM.Root | null = null;
	let container: HTMLElement | null = null;
	let currentProps = initialProps;

	const render = (target: HTMLElement) => {
		container = target;
		if (!root) {
			root = ReactDOM.createRoot(target);
		}
		root.render(React.createElement(Component, currentProps));
	};

	const updateProps = (newProps: any) => {
		currentProps = { ...currentProps, ...newProps };
		if (root && container) {
			root.render(React.createElement(Component, currentProps));
		}
	};

	const unmount = () => {
		if (root) {
			root.unmount();
			root = null;
		}
	};

	return {
		render,
		updateProps,
		unmount
	};
}
