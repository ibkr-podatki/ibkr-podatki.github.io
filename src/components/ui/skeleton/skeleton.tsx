import './skeleton.css'

type Props = {
    height: string;
    width: string;
}

export const Skeleton = ({ width, height }: Props) => {
    return <div className="skeleton" style={{ width, height }} />
}