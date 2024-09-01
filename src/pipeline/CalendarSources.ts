// import { Calendar } from '../Calendar'
// import { AsyncCalendarSource } from './Pipeline'

// type RestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
// interface StaticUrlCalendarSourceParams {
//     url: URL
//     method: RestMethod | undefined
//     headers: Headers
//     unsafe: boolean | undefined
// }
// class StaticUrlCalendarSource extends AsyncCalendarSource<StaticUrlCalendarSourceParams> {
//     this.params: StaticUrlCalendarSourceParams
//     constructor(params: StaticUrlCalendarSourceParams) {
//         this.params = params
//     };
//     getCalendar(): Promise<Calendar> {
//         return new Promise((resolve, reject) => {
//             fetch(params.url, {
//                 method: params.method,
//                 headers: params.headers,
//             }).then(res => {
//                 if (params.unsafe || res.headers.get('')) {
//                 }
//             })
//         })
//     }
// }

// interface DynamicUrlCalendarSourceParams {
//     urlTemplate: String
//     queries: String
//     method: RestMethod | undefined
//     headers: Headers
//     unsafe: boolean | undefined
// }
// class DynamicUrlCalendarSource extends AsyncCalendarSource<DynamicUrlCalendarSourceParams> {
//     getCalendar(params: DynamicUrlCalendarSourceParams): Promise<Calendar> {
//         return new Promise((resolve, reject) => {
//             let url = urlTemplate.format()
//             fetch(url, {
//                 method: params.method,
//                 headers: params.headers,
//             }).then(res => {
//                 if (params.unsafe || res.headers.get('')) {
//                 }
//             })
//         })
//     }
// }
