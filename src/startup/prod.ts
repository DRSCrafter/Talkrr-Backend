import {Application} from "express";
import helmet from "helmet";
import compression from 'compression';

export default function (app: Application) {
    app.use(helmet());
    app.use(compression());
}