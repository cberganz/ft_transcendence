import {
	Controller,
	Get,
	Param,
	Post,
	Put,
	Body,
	UseFilters,
	Delete,
	UseInterceptors,
	UploadedFile,
	UnprocessableEntityException,
	UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User as UserMode1, Prisma } from '@prisma/client';
import BackendException from '../utils/BackendException.filter'
import { FileInterceptor } from '@nestjs/platform-express';
import { fileInterceptorOptions } from '../file/fileInterceptorOptions';
import { DeleteFileOnErrorFilter } from '../file/fileUpload.filter'
import { fileValidator } from '../file/ConstantfileValidator'
import OwnGuard from '../auth/own.guard'
import { updateUserDto } from './upateUserDto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class CreateUser {
	username:	string;
	login:		string;
}

class Game {
	id: number;
	date: string;
	playerScore: number;
	opponent: string;
	opponentScore: number;
	result: string;
}

class UserStats {
	id: number;
	avatar: string;
	username: string;
	games: Game[];
	playedGames: number;
	gamesWon: number;
	gamesLost: number;
	winRate: number;
}

@Controller('user')
export class UserController {
	constructor(
		private readonly userService: UserService,
	) {}

	@Get()
	@UseFilters(BackendException)
	async getUsers(): Promise<UserMode1[]> {
		return this.userService.users({});
	}

	@Get(':id')
	@UseGuards(JwtAuthGuard)
	@UseFilters(BackendException)
	async getUserById(@Param('id') id: string): Promise<UserMode1> {
		return this.userService.user({ id: Number(id) });
	}

	@Get('/stats/:id')
	@UseFilters(BackendException)
	async getUserStats(@Param('id') id: string): Promise<UserStats> {
		let user = await this.userService.user({ id: Number(id) }) as any
		let games = [...user.p1_games, ...user.p2_games]
		let gamesPlayed = games.filter(function(obj) { return obj.player1_score }).map((game) => {
			let player = (game.player1Id === user.id ? 1 : 2)
			return {
				  		id: game.id,
				  		date: game.date,
				  		playerScore: player === 1 ? (game.player1_score) : (game.player2_score),
						opponent: player === 1 ? (game.player2.username) : (game.player1.username),
				  		opponentScore: player === 1 ? (game.player2_score) : (game.player1_score),
						result: player === 1
								? (game.player1_score > game.player2_score
									? ("Winner")
									: (game.player2_score > game.player1_score)
										? ("Loser")
										: ("Equality"))
								: (game.player2_score > game.player1_score
									? ("Winner")
									: (game.player1_score > game.player2_score)
										? ("Loser")
										: ("Equality"))
			};
		});
		let winrate = Math.round(gamesPlayed.filter(function(obj) { return obj.result === "Winner" }).length / gamesPlayed.length * 100)
		const data = {
			id: user.id,
			avatar: user.avatar,
			username: user.username,
			games: gamesPlayed,
			playedGames: gamesPlayed.length,
			gamesWon: gamesPlayed.filter(function(obj) { return obj.result === "Winner" }).length,
			gamesLost: gamesPlayed.filter(function(obj) { return obj.result === "Loser" }).length,
			winRate: winrate ? winrate : -1,
		}
		return data;
	}

	@Get('/list/:id')
	async getAllUsers(@Param('id') id: string): Promise<UserMode1[]> {
		return this.userService.users({where: {NOT: {id: Number(id)}}, orderBy: {username: 'asc'}});
	}

	@Post('signup')
	@UseFilters(BackendException)
	async signupUser (
		@Body() userData: CreateUser
	): Promise<UserMode1> {
		let newUser = {
			...userData,
			avatar: "https://profile.intra.42.fr/assets/42_logo_black-684989d43d629b3c0ff6fd7e1157ee04db9bb7a73fba8ec4e01543d650a1c607.png"
		}
		return this.userService.createUser(newUser);
	}

	@Delete(':id')
	@UseFilters(BackendException)
	async deleteUser(@Param('id') id: string): Promise<UserMode1> {
		return this.userService.deleteUser({ id: Number(id) });
	}

	@Put('/upload/avatar/:id')
	@UseGuards(OwnGuard)
	@UseInterceptors(FileInterceptor('file', fileInterceptorOptions))
	@UseFilters(DeleteFileOnErrorFilter)
	async uploadAvatar(
		@UploadedFile(fileValidator) file: Express.Multer.File,
		@Param('id') id: string,
		): Promise<UserMode1> {
			const imageUrl = `http://localhost:3000/file/avatar/${file.filename}`
			let updatedData = {
				avatar: imageUrl,
			}
			return this.userService.updateUser({
				where: {
					id: Number(id)
				},
				data: updatedData
			});
	}


	@Put(':id')
	@UseGuards(OwnGuard)
	async updateUserName(
		@Param('id') id: string,
		@Body() body: updateUserDto
		): Promise<UserMode1> {
			const user = await this.userService.user({id: Number(id)})
			const userWithSameUsername =
				await this.userService.user({username: String(body.username)});
			if (userWithSameUsername && userWithSameUsername.id !== Number(id))
				throw new UnprocessableEntityException();
			user.username = body.username
			return this.userService.updateUser({
				where: {
					id: Number(id)
				},
				data: {
					username: user.username,
				}
			});
	}
}
