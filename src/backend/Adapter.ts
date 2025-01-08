import { Router } from 'express'

abstract class Adapter {
    abstract createRouter(): Router
}
export default Adapter
