/**
 * Forms Builder — State Management Hook
 *
 * Custom React hook that manages the form builder state including:
 * - Field CRUD operations
 * - Undo / redo with full history
 * - Copy / paste / duplicate
 * - Drag-and-drop reordering
 * - JSON import/export
 * - Auto-dirty tracking
 */

import * as React from "react";

import { createCanvasField, getTemplateFields } from "./field-defaults.js";
import type {
	AfterSubmitConfig,
	CanvasField,
	HistoryEntry,
	NextButtonConfig,
	PreviewMode,
	SubmitButtonConfig,
} from "./types.js";

const MAX_HISTORY = 50;

// =============================================================================
// Default button configs
// =============================================================================

export const DEFAULT_SUBMIT_BUTTON: SubmitButtonConfig = {
	label: "Submit",
	size: "md",
	align: "right",
	variant: "filled",
	backgroundColor: "",
	textColor: "",
	borderRadius: "8px",
	borderColor: "",
	fontSize: "14px",
	fontWeight: "600",
	paddingX: "24px",
	paddingY: "10px",
	icon: "",
	iconPosition: "before",
	loadingText: "Submitting...",
	successText: "Submitted!",
	disableAfterSubmit: true,
	showReset: false,
	resetLabel: "Reset",
	customClass: "",
};

export const DEFAULT_NEXT_BUTTON: NextButtonConfig = {
	label: "Next",
	size: "md",
	align: "right",
	variant: "filled",
	backgroundColor: "",
	textColor: "",
	borderRadius: "8px",
	borderColor: "",
	fontSize: "14px",
	fontWeight: "600",
	paddingX: "24px",
	paddingY: "10px",
	showPrev: true,
	prevLabel: "Previous",
	customClass: "",
};

export const DEFAULT_AFTER_SUBMIT: AfterSubmitConfig = {
	thankYouMode: "message",
	thankYouMessage: "Thank you! Your submission has been received.",
	redirectUrl: "",
	showTrackingCode: true,
	submissionMode: "standard",
};

export interface FormBuilderActions {
	// Field operations
	addField: (fieldType: string, index?: number) => void;
	addFieldToGroup: (fieldType: string, groupId: string) => void;
	removeField: (instanceId: string) => void;
	duplicateField: (instanceId: string) => void;
	moveField: (fromIndex: number, toIndex: number) => void;
	moveFieldUp: (instanceId: string) => void;
	moveFieldDown: (instanceId: string) => void;
	updateField: (instanceId: string, updates: Partial<CanvasField>) => void;
	selectField: (instanceId: string | null) => void;

	// Clipboard
	copyField: (instanceId: string) => void;
	pasteField: (afterInstanceId?: string) => void;

	// History
	undo: () => void;
	redo: () => void;
	canUndo: boolean;
	canRedo: boolean;

	// Preview
	setPreviewMode: (mode: PreviewMode) => void;

	// Form meta
	setFormName: (name: string) => void;
	setFormDescription: (desc: string) => void;

	// Save state
	markClean: () => void;

	// Import / Export
	exportJson: () => string;
	importJson: (json: string) => boolean;

	// Bulk
	clearAll: () => void;

	// Button config
	updateSubmitButton: (updates: Partial<SubmitButtonConfig>) => void;
	updateNextButton: (updates: Partial<NextButtonConfig>) => void;

	// After-submission config
	updateAfterSubmit: (updates: Partial<AfterSubmitConfig>) => void;

	// Load existing form
	loadForm: (data: {
		formId: string;
		name: string;
		description: string;
		fields: CanvasField[];
		afterSubmit?: AfterSubmitConfig;
	}) => void;
}

export interface FormBuilderHook {
	fields: CanvasField[];
	selectedFieldId: string | null;
	selectedField: CanvasField | null;
	clipboard: CanvasField | null;
	isDirty: boolean;
	formId: string | null;
	setFormId: (id: string) => void;
	formName: string;
	formDescription: string;
	previewMode: PreviewMode;
	submitButton: SubmitButtonConfig;
	nextButton: NextButtonConfig;
	afterSubmit: AfterSubmitConfig;
	hasSteps: boolean;
	actions: FormBuilderActions;
}

export function useFormBuilder(templateId: string): FormBuilderHook {
	const [fields, setFields] = React.useState<CanvasField[]>(() => getTemplateFields(templateId));
	const [selectedFieldId, setSelectedFieldId] = React.useState<string | null>(null);
	const [clipboard, setClipboard] = React.useState<CanvasField | null>(null);
	const [undoStack, setUndoStack] = React.useState<HistoryEntry[]>([]);
	const [redoStack, setRedoStack] = React.useState<HistoryEntry[]>([]);
	const [isDirty, setIsDirty] = React.useState(false);
	const [formId, setFormId] = React.useState<string | null>(null);
	const [formName, setFormName] = React.useState("Untitled Form");
	const [formDescription, setFormDescription] = React.useState("");
	const [previewMode, setPreviewMode] = React.useState<PreviewMode>("desktop");
	const [submitButton, setSubmitButton] = React.useState<SubmitButtonConfig>(DEFAULT_SUBMIT_BUTTON);
	const [nextButton, setNextButton] = React.useState<NextButtonConfig>(DEFAULT_NEXT_BUTTON);
	const [afterSubmit, setAfterSubmit] = React.useState<AfterSubmitConfig>(DEFAULT_AFTER_SUBMIT);

	// Derived: does the form have step fields?
	const hasSteps = React.useMemo(() => fields.some((f) => f.fieldType === "step"), [fields]);

	// Refs to access current state without stale closures
	const fieldsRef = React.useRef(fields);
	fieldsRef.current = fields;
	const selectedFieldIdRef = React.useRef(selectedFieldId);
	selectedFieldIdRef.current = selectedFieldId;

	// Push current state onto undo stack before mutation
	const pushUndo = React.useCallback(() => {
		const currentFields = fieldsRef.current;
		const currentSelected = selectedFieldIdRef.current;
		setUndoStack((prev) => {
			const entry: HistoryEntry = {
				fields: currentFields.map((f) => ({ ...f })),
				selectedFieldId: currentSelected,
				timestamp: Date.now(),
			};
			const next = [...prev, entry];
			if (next.length > MAX_HISTORY) next.shift();
			return next;
		});
		setRedoStack([]);
	}, []);

	// Wrapped setter that tracks undo — side effects happen BEFORE the pure updater
	const mutateFields = React.useCallback(
		(updater: (prev: CanvasField[]) => CanvasField[]) => {
			pushUndo();
			setIsDirty(true);
			setFields(updater);
		},
		[pushUndo],
	);

	const addField = React.useCallback(
		(fieldType: string, index?: number) => {
			const newField = createCanvasField(fieldType);
			mutateFields((prev) => {
				if (index !== undefined && index >= 0 && index <= prev.length) {
					const next = [...prev];
					next.splice(index, 0, newField);
					return next;
				}
				return [...prev, newField];
			});
			setSelectedFieldId(newField.instanceId);
		},
		[mutateFields],
	);

	const addFieldToGroup = React.useCallback(
		(fieldType: string, groupId: string) => {
			const newField = createCanvasField(fieldType);
			newField.groupId = groupId;
			mutateFields((prev) => [...prev, newField]);
			setSelectedFieldId(newField.instanceId);
		},
		[mutateFields],
	);

	const removeField = React.useCallback(
		(instanceId: string) => {
			mutateFields((prev) => prev.filter((f) => f.instanceId !== instanceId));
			setSelectedFieldId((prev) => (prev === instanceId ? null : prev));
		},
		[mutateFields],
	);

	const duplicateField = React.useCallback(
		(instanceId: string) => {
			mutateFields((prev) => {
				const idx = prev.findIndex((f) => f.instanceId === instanceId);
				if (idx === -1) return prev;
				const original = prev[idx]!;
				const clone: CanvasField = {
					...JSON.parse(JSON.stringify(original)),
					instanceId: `${original.fieldType}_${Date.now()}_dup`,
					name: `${original.name}_copy`,
					label: `${original.label} (Copy)`,
				};
				const next = [...prev];
				next.splice(idx + 1, 0, clone);
				return next;
			});
		},
		[mutateFields],
	);

	const moveField = React.useCallback(
		(fromIndex: number, toIndex: number) => {
			if (fromIndex === toIndex) return;
			mutateFields((prev) => {
				const next = [...prev];
				const [moved] = next.splice(fromIndex, 1);
				if (!moved) return prev;
				next.splice(toIndex, 0, moved);
				return next;
			});
		},
		[mutateFields],
	);

	const moveFieldUp = React.useCallback(
		(instanceId: string) => {
			pushUndo();
			setIsDirty(true);
			setFields((prev) => {
				const idx = prev.findIndex((f) => f.instanceId === instanceId);
				if (idx <= 0) return prev;
				const next = [...prev];
				[next[idx - 1], next[idx]] = [next[idx]!, next[idx - 1]!];
				return next;
			});
		},
		[pushUndo],
	);

	const moveFieldDown = React.useCallback(
		(instanceId: string) => {
			pushUndo();
			setIsDirty(true);
			setFields((prev) => {
				const idx = prev.findIndex((f) => f.instanceId === instanceId);
				if (idx === -1 || idx >= prev.length - 1) return prev;
				const next = [...prev];
				[next[idx], next[idx + 1]] = [next[idx + 1]!, next[idx]!];
				return next;
			});
		},
		[pushUndo],
	);

	const updateField = React.useCallback(
		(instanceId: string, updates: Partial<CanvasField>) => {
			pushUndo();
			setIsDirty(true);
			setFields((prev) =>
				prev.map((f) => (f.instanceId === instanceId ? { ...f, ...updates } : f)),
			);
		},
		[pushUndo],
	);

	const selectField = React.useCallback((instanceId: string | null) => {
		setSelectedFieldId(instanceId);
	}, []);

	const copyField = React.useCallback(
		(instanceId: string) => {
			const field = fields.find((f) => f.instanceId === instanceId);
			if (field) {
				setClipboard(JSON.parse(JSON.stringify(field)));
			}
		},
		[fields],
	);

	const pasteField = React.useCallback(
		(afterInstanceId?: string) => {
			if (!clipboard) return;
			const clone: CanvasField = {
				...JSON.parse(JSON.stringify(clipboard)),
				instanceId: `${clipboard.fieldType}_${Date.now()}_paste`,
				name: `${clipboard.name}_pasted`,
				label: `${clipboard.label} (Pasted)`,
			};
			mutateFields((prev) => {
				if (afterInstanceId) {
					const idx = prev.findIndex((f) => f.instanceId === afterInstanceId);
					if (idx !== -1) {
						const next = [...prev];
						next.splice(idx + 1, 0, clone);
						return next;
					}
				}
				return [...prev, clone];
			});
			setSelectedFieldId(clone.instanceId);
		},
		[clipboard, mutateFields],
	);

	const undo = React.useCallback(() => {
		setUndoStack((prevUndo) => {
			if (prevUndo.length === 0) return prevUndo;
			const entry = prevUndo.at(-1)!;
			const newUndo = prevUndo.slice(0, -1);

			// Push current state to redo
			const currentFields = fieldsRef.current;
			const currentSelected = selectedFieldIdRef.current;
			setRedoStack((prevRedo) => [
				...prevRedo,
				{
					fields: currentFields.map((f) => ({ ...f })),
					selectedFieldId: currentSelected,
					timestamp: Date.now(),
				},
			]);
			setFields(entry.fields);
			setSelectedFieldId(entry.selectedFieldId);
			setIsDirty(true);
			return newUndo;
		});
	}, []);

	const redo = React.useCallback(() => {
		setRedoStack((prevRedo) => {
			if (prevRedo.length === 0) return prevRedo;
			const entry = prevRedo.at(-1)!;
			const newRedo = prevRedo.slice(0, -1);

			const currentFields = fieldsRef.current;
			const currentSelected = selectedFieldIdRef.current;
			setUndoStack((prevUndo) => [
				...prevUndo,
				{
					fields: currentFields.map((f) => ({ ...f })),
					selectedFieldId: currentSelected,
					timestamp: Date.now(),
				},
			]);
			setFields(entry.fields);
			setSelectedFieldId(entry.selectedFieldId);
			setIsDirty(true);
			return newRedo;
		});
	}, []);

	const exportJson = React.useCallback(() => {
		const formData = {
			version: "1.0.0",
			name: formName,
			description: formDescription,
			fields: fields.map((f, i) => ({ ...f, order: i })),
			submitButton,
			nextButton,
			afterSubmit,
			exportedAt: new Date().toISOString(),
		};
		return JSON.stringify(formData, null, 2);
	}, [fields, formName, formDescription, submitButton, nextButton, afterSubmit]);

	const importJson = React.useCallback(
		(json: string): boolean => {
			try {
				const data = JSON.parse(json);
				if (!data.fields || !Array.isArray(data.fields)) return false;
				pushUndo(fields, selectedFieldId);
				setFields(data.fields);
				if (data.name) setFormName(data.name);
				if (data.description) setFormDescription(data.description);
				if (data.submitButton) setSubmitButton({ ...DEFAULT_SUBMIT_BUTTON, ...data.submitButton });
				if (data.nextButton) setNextButton({ ...DEFAULT_NEXT_BUTTON, ...data.nextButton });
				if (data.afterSubmit) setAfterSubmit({ ...DEFAULT_AFTER_SUBMIT, ...data.afterSubmit });
				setSelectedFieldId(null);
				setIsDirty(true);
				return true;
			} catch {
				return false;
			}
		},
		[fields, selectedFieldId, pushUndo],
	);

	const clearAll = React.useCallback(() => {
		mutateFields(() => []);
		setSelectedFieldId(null);
	}, [mutateFields]);

	const updateSubmitButton = React.useCallback((updates: Partial<SubmitButtonConfig>) => {
		setSubmitButton((prev) => ({ ...prev, ...updates }));
		setIsDirty(true);
	}, []);

	const updateNextButton = React.useCallback((updates: Partial<NextButtonConfig>) => {
		setNextButton((prev) => ({ ...prev, ...updates }));
		setIsDirty(true);
	}, []);

	const updateAfterSubmit = React.useCallback((updates: Partial<AfterSubmitConfig>) => {
		setAfterSubmit((prev) => ({ ...prev, ...updates }));
		setIsDirty(true);
	}, []);

	const markClean = React.useCallback(() => {
		setIsDirty(false);
	}, []);

	const loadForm = React.useCallback(
		(data: {
			formId: string;
			name: string;
			description: string;
			fields: CanvasField[];
			afterSubmit?: AfterSubmitConfig;
		}) => {
			setFormId(data.formId);
			setFormName(data.name);
			setFormDescription(data.description);
			setFields(data.fields);
			if (data.afterSubmit) setAfterSubmit({ ...DEFAULT_AFTER_SUBMIT, ...data.afterSubmit });
			setSelectedFieldId(null);
			setUndoStack([]);
			setRedoStack([]);
			setIsDirty(false);
		},
		[],
	);

	// Keyboard shortcuts
	React.useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			const isCtrl = e.ctrlKey || e.metaKey;
			if (isCtrl && e.key === "z" && !e.shiftKey) {
				e.preventDefault();
				if (undoStack.length > 0) undo();
			} else if (isCtrl && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
				e.preventDefault();
				if (redoStack.length > 0) redo();
			} else if (isCtrl && e.key === "c" && selectedFieldId) {
				e.preventDefault();
				copyField(selectedFieldId);
			} else if (isCtrl && e.key === "v" && clipboard) {
				e.preventDefault();
				pasteField(selectedFieldId ?? undefined);
			} else if (isCtrl && e.key === "d" && selectedFieldId) {
				e.preventDefault();
				duplicateField(selectedFieldId);
			} else if (e.key === "Delete" && selectedFieldId) {
				const active = document.activeElement;
				if (
					active instanceof HTMLInputElement ||
					active instanceof HTMLTextAreaElement ||
					active instanceof HTMLSelectElement
				)
					return;
				e.preventDefault();
				removeField(selectedFieldId);
			} else if (e.key === "Escape") {
				setSelectedFieldId(null);
			}
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [
		undoStack.length,
		redoStack.length,
		selectedFieldId,
		clipboard,
		undo,
		redo,
		copyField,
		pasteField,
		duplicateField,
		removeField,
	]);

	const selectedField = React.useMemo(
		() => fields.find((f) => f.instanceId === selectedFieldId) ?? null,
		[fields, selectedFieldId],
	);

	const actions: FormBuilderActions = React.useMemo(
		() => ({
			addField,
			addFieldToGroup,
			removeField,
			duplicateField,
			moveField,
			moveFieldUp,
			moveFieldDown,
			updateField,
			selectField,
			copyField,
			pasteField,
			undo,
			redo,
			canUndo: undoStack.length > 0,
			canRedo: redoStack.length > 0,
			setPreviewMode,
			setFormName,
			setFormDescription,
			markClean,
			exportJson,
			importJson,
			clearAll,
			updateSubmitButton,
			updateNextButton,
			updateAfterSubmit,
			loadForm,
		}),
		[
			addField,
			addFieldToGroup,
			removeField,
			duplicateField,
			moveField,
			moveFieldUp,
			moveFieldDown,
			updateField,
			selectField,
			copyField,
			pasteField,
			undo,
			redo,
			undoStack.length,
			redoStack.length,
			exportJson,
			importJson,
			clearAll,
			markClean,
			updateSubmitButton,
			updateNextButton,
			updateAfterSubmit,
			loadForm,
		],
	);

	return {
		fields,
		selectedFieldId,
		selectedField,
		clipboard,
		isDirty,
		formId,
		setFormId,
		formName,
		formDescription,
		previewMode,
		submitButton,
		nextButton,
		afterSubmit,
		hasSteps,
		actions,
	};
}
