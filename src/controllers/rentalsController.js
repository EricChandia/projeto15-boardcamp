import connection from '../dbStrategy/postgres.js';
import joi from 'joi';

/*
{
  id: 1,
  customerId: 1,
  gameId: 1,
  rentDate: '2021-06-20',    // data em que o aluguel foi feito
  daysRented: 3,             // por quantos dias o cliente agendou o aluguel
  returnDate: null,          // data que o cliente devolveu o jogo (null enquanto não devolvido)
  originalPrice: 4500,       // preço total do aluguel em centavos (dias alugados vezes o preço por dia do jogo)
  delayFee: null             // multa total paga por atraso (dias que passaram do prazo vezes o preço por dia do jogo)
}
*/
const customerSchema = joi.object({
    customerId: joi.number().required(),
    gameId: joi.number().required(),
    rentDate: joi.string().required().regex(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/),
    daysRented: joi.number().required(),
    returnDate: joi.string().required().regex(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/),
    originalPrice: joi.number().required().min(0),
    delayFee: joi.number().required()
  })

  export async function getRentals(req, res){
    try{
        const customerId = req.query.customerId;
        const gameId = req.query.gameId;
        let rentals;

        if(customerId){
            const { rows } = await connection.query('SELECT rentals.*, customers."id" as "customer_Id", customers."name" as "customerName", games."id" as "game_Id", games."name" as "gameName", categories."id" as "category_Id", categories."name" as "categoryName" from rentals \
            inner join games on games.id = rentals."gameId" \
            inner join customers on customers.id = rentals."customerId" \
            inner join categories on categories.id = games."categoryId" \
            WHERE "customerId" = $1', [customerId]); 
            rentals = [...rows];
        }
        
        else if(gameId){
            const { rows } = await connection.query('SELECT rentals.*, customers."id" as "customer_Id", customers."name" as "customerName", games."id" as "game_Id", games."name" as "gameName", categories."id" as "category_Id", categories."name" as "categoryName" from rentals \
            inner join games on games.id = rentals."gameId" \
            inner join customers on customers.id = rentals."customerId" \
            inner join categories on categories.id = games."categoryId" \
            WHERE "gameId" = $1', [gameId]);
            rentals = [...rows];
        }else{
            const { rows } = await connection.query('SELECT rentals.*, customers."id" as "customer_Id", customers."name" as "customerName", games."id" as "game_Id", games."name" as "gameName", categories."id" as "category_Id", categories."name" as "categoryName" from rentals \
            inner join games on games.id = rentals."gameId" \
            inner join customers on customers.id = rentals."customerId" \
            inner join categories on categories.id = games."categoryId"');
            rentals = [...rows];
        }

        let rentalsJoin = [...rentals];
        for(let i=0; i<rentalsJoin.length;i++){
            let customer;
            let game;

            customer = { id: rentalsJoin[i].customer_Id, name: rentalsJoin[i].customerName };
            game = { id: rentalsJoin[i].game_Id, name: rentalsJoin[i].gameName, categoryId: rentalsJoin[i].category_Id, categoryName: rentalsJoin[i].categoryName };

            // const f = rentalsJoin[i].rentDate;
            // console.log(String(f).substring(0, 20));

            delete rentalsJoin[i].customer_Id; delete rentalsJoin[i].customerName;
            delete rentalsJoin[i].game_Id; delete rentalsJoin[i].gameName; delete rentalsJoin[i].category_Id; delete rentalsJoin[i].categoryName;

            rentalsJoin[i] = { ...rentalsJoin[i], customer: {...customer}, game: {...game} };
        }

        return res.send(rentalsJoin);

    }catch(error){
        console.log(error);
        res.sendStatus(500);
    }
  }