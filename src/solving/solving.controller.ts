import {
    Body,
    Controller,
    Post
} from '@nestjs/common';
import {
    IBody,
    IInitValue,
    IOutputPermutation,
    IResponseSolution,
    IRoutes,
    IValidation,
    IVehicle
} from './solving.interface';

@Controller('solving')
export class SolvingController {

    @Post('/')
    find(@Body() object: IBody): any {
        const validatedBody = this.validateBody(object)
        if (validatedBody.status) {
            const matrix = this.setMatrix(object);

            const solution = this.findSolution(matrix.slice(), object);
            return solution;
        }
        return {
            data: [],
            validation: validatedBody
        }
    }

    validateBody = (object: IBody): IValidation => {
        if (object.payload.volume.length !== object.time.length) {
            return {
                status: false,
                message: 'Volume is not match with time matrix'
            };
        };

        if (object.payload.weight.length !== object.time.length) {
            return {
                status: false,
                message: 'Weight is not match with time matrix'
            };
        };

        return {
            status: true
        };
    };

    findSolution = (
        matrix: IOutputPermutation[],
        object: IBody
    ): IResponseSolution => {
        let routeList: Array<number> = [];
        let valueList: Array<number> = [];
        let routes: IRoutes[] = [];
        const selectedSet = new Set();
        let validation: IValidation = { status: true };
        // console.log('# findSolution function process')
        const sumWithSlack = (arr: Array<number>, slack: number): number => {
            let total = 0;
            for (let index = 0; index < arr.length; index++) {
                if (index === arr.length - 1) {
                    total += arr[index];
                } else {
                    if (arr[index] === 0) {
                        total += arr[index];
                    } else {
                        total += arr[index] + slack;
                    }
                }
            } return total;
        };

        const reduceDestination = (
            routeList: Array<number>,
            valueList: Array<number>,
            matrix: Array<Array<number>>
        ) => {
            let routeArr = [];
            let valueArr = [];
            if (routeList.length) {
                if (routeList.length === 1) {
                    valueArr.push(matrix[routeArr[0]][0]);
                    routeArr.push(0);
                } else {
                    routeArr = routeList.slice(0, routeList.length - 2);
                    valueArr = valueList.slice(0, valueList.length - 2);
                    valueArr.push(matrix[routeArr[routeArr.length - 1]][0]);
                    routeArr.push(0);
                };
            };
            return {
                routeArr,
                valueArr
            };
        };

        const sumCapacity = (
            routeArr: Array<number>,
            weight: Array<number>,
            volume: Array<number>
        ) => {
            let totalWeight = 0
            let totalVolume = 0
            for (let index = 0; index < routeArr.length; index++) {
                totalWeight += weight[routeArr[index]]
                totalVolume += volume[routeArr[index]]
            };
            return {
                totalWeight,
                totalVolume
            };
        };

        const setVehicle = (routesArr: IRoutes[], vehicles: IVehicle[], count: number) => {
            if (
                count === routes.length - 1 ||
                routesArr.length === 0
            ) {
                routes = routesArr;
                return;
            };

            if (routesArr.length > vehicles.length && count === 0) {
                routes = [];
                validation = {
                    status: false,
                    message: 'Quantity of vehicle is not enough'
                };
                return;
            };

            for (let vehicleIndex = 0; vehicleIndex < vehicles.length; vehicleIndex++) {
                for (let routesIndex = 0; routesIndex < routesArr.length; routesIndex++) {
                    if (
                        routesArr[routesIndex].weight < vehicles[vehicleIndex].weight &&
                        routesArr[routesIndex].volume < vehicles[vehicleIndex].volume &&
                        !routesArr[routesIndex].id
                    ) {
                        routesArr[routesIndex].id = vehicles[vehicleIndex].id
                        vehicles[vehicleIndex].weight = -1
                        vehicles[vehicleIndex].volume = -1
                    };
                };
            };
            return setVehicle(routesArr, vehicles, count + 1);
        }

        const addRoute = (
            routeArr: Array<number>,
            valueArr: Array<number>,
            weight: number,
            volume: number,
            total: number) => {
            let selectedArr = [];
            const resultRoute: IRoutes = {
                legs: routeArr,
                duration: valueArr,
                total: total,
                weight,
                volume
            };
            routes.push(resultRoute)
            for (let index = 0; index < routeArr.length - 1; index++) {
                selectedSet.add(routeArr[index])
            };
            selectedArr = [...selectedSet]
            return selectedArr
        };

        const setConstraint = (
            arrMatrix: IOutputPermutation[],
            routeArr: Array<number>,
            valueArr: Array<number>,
            body: IBody): any => {
            const sliceArr = JSON.parse(JSON.stringify(arrMatrix))
            const totalTime: number = sumWithSlack(valueArr, body.conditions.slack)
            const { totalVolume, totalWeight } = sumCapacity(
                routeArr,
                body.payload.weight,
                body.payload.volume
            );
            // max duration is not enough case, even system reduced to one destination 
            if (routeArr.length === 2 && totalTime > body.conditions.maxDuration) {
                // console.log('# when max duration is not enough')
                routes = []
                validation = {
                    status: false,
                    message: 'Max duration not enough for solution calculated'
                };
                return;
            };

            if (totalTime > body.conditions.maxDuration) {
                const destination = reduceDestination(routeArr, valueArr, body.time)
                routeArr = destination.routeArr
                valueArr = destination.valueArr
                setConstraint(arrMatrix, routeArr, valueArr, body)
            } else {
                const selectedArr = addRoute(
                    routeArr,
                    valueArr,
                    totalWeight,
                    totalVolume,
                    totalTime,
                );

                for (let selectedIndex = 0; selectedIndex < selectedArr.length; selectedIndex++) {
                    for (let matrixIndex = 0; matrixIndex < sliceArr.length; matrixIndex++) {
                        sliceArr[matrixIndex].value[selectedArr[selectedIndex] as number] = -2;
                    };
                };
                if (selectedArr.length === arrMatrix.length - 1) {
                    return;
                } else {
                    routeList = [];
                    valueList = [];
                    setRoute(sliceArr, 0, (arrMatrix.length - selectedArr.length) - 1, 0, body);
                    return setConstraint(arrMatrix, routeList, valueList, body);
                };

            };
        };

        const initialValue = (valueArr: Array<number>): IInitValue => {
            let value = 0;
            let routeIndex = 0;
            for (let index = 0; index < valueArr.length; index++) {
                if (valueArr[index] >= 0) {
                    value = valueArr[index];
                    routeIndex = index;
                }
            };

            return {
                valueInit: value,
                routeInit: routeIndex
            };

        }

        const setRoute = (
            arrMatrix: IOutputPermutation[],
            count: number,
            end: number,
            key: number,
            body: IBody
        ) => {
            const { time } = body;
            const target = arrMatrix.find(matrix => matrix.key === key);
            const responseInit = initialValue(target.value);
            let valueTemp: number = responseInit.valueInit;
            let routeTemp: number = responseInit.routeInit;
            if (key === 0) {
                for (let matrixIndex = 0; matrixIndex < time.length; matrixIndex++) {
                    for (let legIndex = 0; legIndex < time.length; legIndex++) {
                        arrMatrix[matrixIndex].value[key] = -2;
                    }
                }
            }

            for (let index = 0; index < time.length; index++) {
                if (valueTemp >= target.value[index] && target.value[index] >= 0) {
                    valueTemp = target.value[index];
                    routeTemp = target.route[index];
                };
            };

            for (let matrixIndex = 0; matrixIndex < time.length; matrixIndex++) {
                for (let legIndex = 0; legIndex < time.length; legIndex++) {
                    arrMatrix[matrixIndex].value[routeTemp] = -2;
                };
            };

            if (count >= end) {
                routeList.push(0);
                valueList.push(time[routeList[routeList.length - 2]][0]);
                return;
            } else {
                routeList.push(routeTemp);
                valueList.push(valueTemp);
                return setRoute(arrMatrix, count + 1, end, routeTemp, body);
            };
        };

        setRoute(JSON.parse(JSON.stringify(matrix)),
            0, // init count
            object.time.length - 1,
            0, // init key
            object
        );
        setConstraint(JSON.parse(JSON.stringify(matrix)),
            routeList.slice(),
            valueList.slice(),
            object
        );
        setVehicle(routes, object.vehicles, 0)
        return {
            data: routes,
            validation: validation
        };

    };

    setMatrix(body: IBody): IOutputPermutation[] {
        let result = [];
        let routeTemp = [];
        let valueTemp = [];
        const { time } = body
        for (let timeIndex = 0; timeIndex < time.length; timeIndex++) {
            routeTemp = [];
            valueTemp = [];
            for (let routeIndex = 0; routeIndex < time[timeIndex].length; routeIndex++) {
                if (routeIndex === timeIndex) {
                    time[timeIndex][routeIndex] = -1;
                }
                valueTemp.push(time[timeIndex][routeIndex]);
                routeTemp.push(routeIndex);
            }
            result = [
                ...result,
                {
                    value: valueTemp,
                    route: routeTemp,
                    key: timeIndex
                }
            ]
        };
        return result;
    };


}
