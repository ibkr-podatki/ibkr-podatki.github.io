import { Icon } from '../ui/icon';
import './upload-files.css';

type Props = {
	fileName: string;
	year: string;
	hasError?: boolean;
};
export const UploadedFile = ({ fileName, year, hasError }: Props) => {
	return (
		<div className="upload-files__uploaded-item">
			<Icon icon={hasError ? 'cancel' : 'check-circle'} color={hasError ? 'red' : 'green'} />
			<b>{year}</b>
			<span className="upload-files__uploaded-item__file-name" title={fileName}>
				{fileName}
			</span>
		</div>
	);
};
