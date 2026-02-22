import { Cancel, CheckCircle, ChevronDown, CloudUpload } from '../../../icons';

export const Icons = {
	'chevron-down': ChevronDown,
	'cloud-upload': CloudUpload,
	'check-circle': CheckCircle,
	cancel: Cancel
};

export type IconType = keyof typeof Icons;
