export type IBody = {
    time: Array<Array<number>>;
    payload: IPayload;
    conditions: ICondition;
    vehicles?: IVehicle[];
}

export type IVehicle = {
    id: string;
    weight: number;
    volume: number;
}

export type IPayload = {
    weight: Array<number>;
    volume: Array<number>;
}

export type ICondition = {
    maxDuration: number;
    slack: number;
}

export type IOutputPermutation = {
    value: Array<number>;
    route: Array<number>;
    key: number;
}

export type IRoutes = {
    id?: string;
    legs: Array<number>;
    duration: Array<number>;
    total: number;
    weight?: number;
    volume?: number;
}

export type IValidation = {
    message?: string;
    status: boolean;
}

export type IResponseSolution = {
    data: IRoutes[];
    validation?: IValidation;
}

export type IInitValue = {
    valueInit: number;
    routeInit: number;
}

export type IRouteByPermutation = {
    total?: number;
    duration?: number[];
    legs?: number[];
}