import { Cancel, CheckCircle, ChevronDown, CloudUpload, Print } from '../../../icons';

export const Icons = {
	'chevron-down': ChevronDown,
	'cloud-upload': CloudUpload,
	'check-circle': CheckCircle,
	print: Print,
	cancel: Cancel
};

export type IconType = keyof typeof Icons;
