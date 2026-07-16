let selected_month = '2026-04';

export function set_selected_month(month){
    selected_month = month;

    document.dispatchEvent(
        new CustomEvent("monthChange", {
            detail: month
        })
    );
}

export function get_selected_month(){
    return selected_month;
}