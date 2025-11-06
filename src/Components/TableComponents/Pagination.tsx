import { ReactElement } from "react";

export default function Pagination(props: {
    page: number;
    totalPages: number;
    changePage: Function;
}) {
    /**
     * Update the input.
     */
    function handleChange(e: any): void {
        !!e.target.value &&
            e.target.value <= props.totalPages &&
            props.changePage(e.target.value);
    }

    let pages: Array<ReactElement> = [];

    if (props.page == 1) {
        pages = [
            <div
                className="pagination:number pagination:active"
                onClick={() => props.changePage(props.page)}
            >
                {props.page}
            </div>,
            <div
                className="pagination:number"
                onClick={() => props.changePage(props.page + 1)}
            >
                {props.page + 1}
            </div>,
            <div
                className="pagination:number"
                onClick={() => props.changePage(props.page + 1)}
            >
                {props.page + 2}
            </div>,
            <div
                className="pagination:number"
                onClick={() => props.changePage(props.page + 3)}
            >
                {props.page + 3}
            </div>,
            <div
                className="pagination:number"
                onClick={() => props.changePage(props.totalPages)}
            >
                {props.totalPages}
            </div>,
            <div
                className="pagination:number arrow"
                onClick={() => props.changePage(Number(props.page) + 1)}
            >
                <svg width="18" height="18">
                    <use xlinkHref="#right" />
                </svg>
            </div>,
        ];
    } else if (props.page == 2) {
        pages = [
            <div
                className="pagination:number arrow"
                onClick={() => props.changePage(Number(props.page) - 1)}
            >
                <svg width="18" height="18">
                    <use xlinkHref="#left" />
                </svg>
                <span className="arrow:text">Previous</span>
            </div>,
            <div
                className="pagination:number"
                onClick={() => props.changePage(props.page - 1)}
            >
                {props.page - 1}
            </div>,

            <div
                className="pagination:number"
                onClick={() => props.changePage(props.page)}
            >
                {props.page}
            </div>,
            <div
                className="pagination:number"
                onClick={() => props.changePage(props.page + 1)}
            >
                {props.page + 1}
            </div>,
            <div
                className="pagination:number"
                onClick={() => props.changePage(props.page + 2)}
            >
                {props.page + 2}
            </div>,
            <div
                className="pagination:number"
                onClick={() => props.changePage(props.totalPages)}
            >
                {props.totalPages}
            </div>,
            <div
                className="pagination:number arrow"
                onClick={() => props.changePage(Number(props.page) + 1)}
            >
                <svg width="18" height="18">
                    <use xlinkHref="#right" />
                </svg>
            </div>,
        ];
    } else if (props.page == props.totalPages) {
        pages = [
            <div
                className="pagination:number arrow"
                onClick={() => props.changePage(Number(props.page) - 1)}
            >
                <svg width="18" height="18">
                    <use xlinkHref="#left" />
                </svg>
                <span className="arrow:text">Previous</span>
            </div>,
            <div
                className="pagination:number"
                onClick={() => props.changePage(props.page - 3)}
            >
                {props.page - 3}
            </div>,
            <div
                className="pagination:number"
                onClick={() => props.changePage(props.page - 2)}
            >
                {props.page - 2}
            </div>,
            <div
                className="pagination:number"
                onClick={() => props.changePage(props.page - 1)}
            >
                {props.page - 1}
            </div>,
            <div
                className="pagination:number"
                onClick={() => props.changePage(props.totalPages)}
            >
                {props.totalPages}
            </div>,
        ];
    } else if (props.page == props.totalPages - 1) {
        pages = [
            <div
                className="pagination:number arrow"
                onClick={() => props.changePage(Number(props.page) - 1)}
            >
                <svg width="18" height="18">
                    <use xlinkHref="#left" />
                </svg>
                <span className="arrow:text">Previous</span>
            </div>,
            <div
                className="pagination:number"
                onClick={() => props.changePage(props.page - 2)}
            >
                {props.page - 2}
            </div>,
            <div
                className="pagination:number"
                onClick={() => props.changePage(props.page - 1)}
            >
                {props.page - 1}
            </div>,
            <div
                className="pagination:number pagination:active"
                onClick={() => props.changePage(props.page)}
            >
                {props.page}
            </div>,
            <div
                className="pagination:number"
                onClick={() => props.changePage(props.totalPages)}
            >
                {props.totalPages}
            </div>,
            <div
                className="pagination:number arrow"
                onClick={() => props.changePage(Number(props.page) + 1)}
            >
                <svg width="18" height="18">
                    <use xlinkHref="#right" />
                </svg>
            </div>,
        ];
    } else {
        pages = [
            <div
                className="pagination:number arrow"
                onClick={() => props.changePage(Number(props.page) - 1)}
            >
                <svg width="18" height="18">
                    <use xlinkHref="#left" />
                </svg>
                <span className="arrow:text">Previous</span>
            </div>,
            <div
                className="pagination:number"
                onClick={() => props.changePage(props.page - 1)}
            >
                {props.page - 1}
            </div>,

            <div
                className="pagination:number pagination:active"
                onClick={() => props.changePage(props.page)}
            >
                {props.page}
            </div>,
            <div
                className="pagination:number"
                onClick={() => props.changePage(props.page + 1)}
            >
                {props.page + 1}
            </div>,
            <div
                className="pagination:number"
                onClick={() => props.changePage(props.page + 1)}
            >
                {props.page + 2}
            </div>,
            <div
                className="pagination:number"
                onClick={() => props.changePage(props.totalPages)}
            >
                {props.totalPages}
            </div>,
            <div
                className="pagination:number arrow"
                onClick={() => props.changePage(Number(props.page) + 1)}
            >
                <svg width="18" height="18">
                    <use xlinkHref="#right" />
                </svg>
            </div>,
        ];
    }

    return (
        <div className="zkpr-pagination-container">
            <div className="pagination:container">{pages}</div>

            <svg className="hide">
                <symbol
                    id="left"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 19l-7-7 7-7"
                    ></path>
                </symbol>
                <symbol
                    id="right"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 5l7 7-7 7"
                    ></path>
                </symbol>
            </svg>
        </div>
    );
}
