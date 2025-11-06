export default function SubmitArrow(props: { preSendRequest: Function }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            width="30"
            height="20"
            zoomAndPan="magnify"
            viewBox="0 0 96 95.999999"
            preserveAspectRatio="xMidYMid meet"
            version="1.0"
            onClick={() => props.preSendRequest()}
        >
            <defs>
                <clipPath id="a15659e970">
                    <path
                        d="M 14.785156 10 L 81 10 L 81 86 L 14.785156 86 Z M 14.785156 10 "
                        clip-rule="nonzero"
                    />
                </clipPath>
            </defs>
            <g clip-path="url(#a15659e970)">
                <path
                    fill="#f35638"
                    d="M 14.867188 81.480469 L 14.867188 51.105469 L 47.085938 51.105469 C 49.128906 51.105469 50.789062 49.460938 50.789062 47.433594 C 50.789062 45.40625 49.128906 43.761719 47.085938 43.761719 L 14.867188 43.761719 L 14.867188 14.199219 C 14.867188 11.390625 17.921875 9.621094 20.390625 11.003906 L 78.921875 43.761719 C 81.402344 45.148438 81.441406 48.671875 78.996094 50.113281 L 20.464844 84.632812 C 17.996094 86.089844 14.867188 84.328125 14.867188 81.480469 Z M 14.867188 81.480469 "
                    fill-opacity="1"
                    fill-rule="nonzero"
                />
            </g>
        </svg>
    );
}
