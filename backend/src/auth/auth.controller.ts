import { Controller, Get, Redirect, Req, Res, Post, UseGuards, UseFilters } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard'
import { UserService } from '../user/user.service';
import { JwtRefreshAuthGuard } from './jwt-refresh-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { User as UserMode1 } from '@prisma/client';
import { FtOauthGuard } from './ftAuth.guard';
import BackendException from '../utils/BackendException.filter'

@Controller('auth')
export class AuthController {
	constructor(
		private authService: AuthService,
		private userService: UserService) {}

	@UseGuards(LocalAuthGuard)// je pense que doit recevoir {username, password} obligatoirement ex: {username, login} => error
	@Post('login')
	async login(@Res({ passthrough: true }) response: Response, @Req() req) {
		const jwt_tokens = await this.authService.login(req.user)
		console.log("Login User: ", req.user)
		response.cookie(
			'jwt', 
			jwt_tokens.refresh_token,
			{ 
				maxAge: 3600000, 
				httpOnly: true,
/* 				sameSite: 'none',
				secure: true */
			}
		)
		return { user: req.user, jwt_token: jwt_tokens.access_token };
	}

	@UseGuards(JwtRefreshAuthGuard)
	@UseFilters(BackendException)
	@Get('refresh')
	async refresh(@Req() req) {
		const user: UserMode1 = await this.authService.whoAmI(req)
		console.log('test')
		const jwt_tokens = await this.authService.refreshTokens(user)
		return { user: user, jwt_token: jwt_tokens.access_token };
	}

	@UseGuards(JwtAuthGuard)
	@Post('logout')
	async logout(@Res({ passthrough: true }) response: Response) {
		response.clearCookie('jwt', { httpOnly: true, sameSite: 'none', secure: true})
		response.status(204)
	}

	@Get('42')
	@UseGuards(FtOauthGuard)
	ftAuth() {
	  return;
	}
  
	@Get('42/return')
	@UseGuards(FtOauthGuard)
	@Redirect('http://localhost:3001')
	ftAuthCallback(@Res({ passthrough: true }) response: Response, @Req() req) {
	  return this.login(response, req)
	}
}
