import { Request, Response } from 'express';
import knex from '../database/connection';

class PointsController {
	async index(resquest: Request, response: Response) {
		const { city, uf, items } = resquest.query;

		const parseItems = String(items)
			.split(',')
			.map((item) => Number(item.trim()));

		const points = await knex('points')
			.join('points_items', 'points.id', '=', 'points_items.point_id')
			.whereIn('points_items.item_id', parseItems)
			.where('city', String(city))
			.where('uf', String(uf))
			.distinct()
			.select('points.*');

		const serializedPoints = points.map((point) => {
			return {
				...point,
				image_url: `http://192.168.0.17:3333/tmp/${point.image}`,
			};
		});

		return response.json(serializedPoints);
	}
	async show(resquest: Request, response: Response) {
		const { id } = resquest.params;
		const point = await knex('points').where('id', id).first();

		if (!point)
			return response.status(400).json({ message: 'Point not found.' });

		const serializedPoint = {
			...point,
			image_url: `http://192.168.0.17:3333/tmp/${point.image}`,
		};

		const items = await knex('items')
			.join('points_items', 'items.id', '=', 'points_items.item_id')
			.where('points_items.point_id', id)
			.select('items.titulo');

		return response.json({ serializedPoint, items });
	}
	async create(request: Request, response: Response) {
		const {
			name,
			email,
			whatsapp,
			latitude,
			longitude,
			city,
			uf,
			items,
		} = request.body;

		const point = {
			image: request.file.filename,
			name,
			email,
			whatsapp,
			latitude,
			longitude,
			city,
			uf,
		};

		const trx = await knex.transaction();
		const insertedIds = await trx('points').insert(point);

		const point_id = insertedIds[0];
		const pointItems = items
			.split(',')
			.map((item: string) => Number(item.trim()))
			.map((item_id: number) => {
				return {
					item_id,
					point_id,
				};
			});

		await trx('points_items').insert(pointItems);

		await trx.commit();

		return response.json({
			id: point_id,
			...point,
		});
	}
}

export default PointsController;
