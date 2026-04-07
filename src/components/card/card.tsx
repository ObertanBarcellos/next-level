export interface CardProps {
  children: React.ReactNode;
  className?: string;
  center?: boolean;
}

export default function Card({ children, className, center }: CardProps) {
  return (
    <div className={`w-full h-full bg-white p-4 ${center ? 'flex items-center justify-center' : ''} ${className}`}>
      {children}
    </div>
  );
}