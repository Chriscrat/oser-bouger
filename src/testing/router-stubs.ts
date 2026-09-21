import {
    ActivatedRoute,
    Params,
    ParamMap,
    convertToParamMap,
    provideRouter,
} from "@angular/router";
import { BehaviorSubject } from "rxjs";

/** Provides a testing router with an empty route configuration. */
export function provideRouterTesting() {
    return provideRouter([]);
}

export interface ActivatedRouteStub extends ActivatedRoute {
    setQueryParams(params: Params): void;
}

function buildSnapshot(paramMap: ParamMap, queryParams: Params) {
    return { queryParamMap: paramMap, paramMap, queryParams };
}

/** Returns a stubbed ActivatedRoute with queryParams observable and a setQueryParams method to trigger updates. */
export function activatedRouteStub(initialQueryParams: Params = {}): ActivatedRouteStub {
    const initialParamMap = convertToParamMap(initialQueryParams);
    const queryParamMapSubject = new BehaviorSubject<ParamMap>(initialParamMap);
    const queryParamsSubject = new BehaviorSubject<Params>(initialQueryParams);

    const stub = {
        queryParamMap: queryParamMapSubject,
        queryParams: queryParamsSubject,
        snapshot: buildSnapshot(initialParamMap, initialQueryParams),
        setQueryParams(params: Params): void {
            const paramMap = convertToParamMap(params);
            (stub as { snapshot: unknown }).snapshot = buildSnapshot(paramMap, params);
            queryParamMapSubject.next(paramMap);
            queryParamsSubject.next(params);
        },
    } as unknown as ActivatedRouteStub;

    return stub;
}
