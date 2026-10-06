export default function ApplicationLogo({ className = '', alt = 'Marpariban Entertainment', ...props }) {
    return (
        <img
            {...props}
            src="/images/logo-marpariban.png"
            alt={alt}
            className={className}
        />
    );
}
