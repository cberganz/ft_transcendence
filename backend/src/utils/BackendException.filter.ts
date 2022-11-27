import { HttpStatus, Catch, ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Prisma } from '@prisma/client'
import HttpMessages from './HttpMessages'

import { Request, Response } from 'express';

@Catch(Error)
export default class BackendException implements ExceptionFilter {
	private static httpMessage: HttpMessages = new HttpMessages()
	private static errors: Map<string, HttpStatus>	=
		new Map([
		// cf https://www.prisma.io/docs/reference/api-reference/error-reference
			["P2000", HttpStatus.BAD_REQUEST],
			["P2001", HttpStatus.NOT_FOUND],
			["P2002", HttpStatus.FORBIDDEN],
			["P2003", HttpStatus.CONFLICT],
			["P2004", HttpStatus.BAD_REQUEST],
			["P2005", HttpStatus.BAD_REQUEST],
			["P2006", HttpStatus.BAD_REQUEST],
			["P2007", HttpStatus.BAD_REQUEST],
			["P2008", HttpStatus.UNPROCESSABLE_ENTITY],
			["P2009", HttpStatus.UNPROCESSABLE_ENTITY],
			["P2010", HttpStatus.UNPROCESSABLE_ENTITY],
			["P2011", HttpStatus.UNPROCESSABLE_ENTITY],
			["P2012", HttpStatus.NOT_FOUND],
			["P2013", HttpStatus.UNPROCESSABLE_ENTITY],
			["P2014", HttpStatus.UNPROCESSABLE_ENTITY],
			["P2015", HttpStatus.NOT_FOUND],
			["P2016", HttpStatus.UNPROCESSABLE_ENTITY],
			["P2017", HttpStatus.BAD_REQUEST],
			["P2018", HttpStatus.BAD_REQUEST],
			["P2019", HttpStatus.BAD_REQUEST],
			["P2020", HttpStatus.BAD_REQUEST],
			["P2021", HttpStatus.NOT_FOUND],
			["P2022", HttpStatus.NOT_FOUND],
			["P2023", HttpStatus.BAD_REQUEST],
			["P2024", HttpStatus.REQUEST_TIMEOUT],// verifier apres
			["P2025", HttpStatus.BAD_REQUEST],
			["P2026", HttpStatus.BAD_REQUEST],
			["P2027", HttpStatus.BAD_REQUEST],
			["P2028", HttpStatus.BAD_REQUEST],
			["P2029", HttpStatus.BAD_REQUEST],
			["P2030", HttpStatus.BAD_REQUEST],
			["P2031", HttpStatus.BAD_REQUEST],
			["P2032", HttpStatus.BAD_REQUEST],
			["P2033", HttpStatus.BAD_REQUEST],
			["P2034", HttpStatus.BAD_REQUEST],
	]);

	catch(exception: Error, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const status = this.getStatus(exception);

		response
			.status(status)
			.json({
				statusCode: status,
				timestamp: new Date().toISOString(),
				message: BackendException.httpMessage.getMessage(status),
			});
	}

  	private getStatus(exception: Error): number {
		let status = HttpStatus.INTERNAL_SERVER_ERROR

		if (exception instanceof Prisma.PrismaClientKnownRequestError)
			status = BackendException.errors.get(exception.code)
		else if (exception instanceof Prisma.PrismaClientValidationError)
			status	= HttpStatus.BAD_REQUEST
		return status
	}
}