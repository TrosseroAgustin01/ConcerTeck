const Ticket = require("../models/Ticket");
require("dotenv").config();
const { STRIPE_KEY } = process.env;
const stripe = require("stripe")(STRIPE_KEY);
const Events = require("../models/Events");
const TicketStock = require("../models/TicketStock");
const User = require("../models/User");
const { ticketVoucher } = require("./TicketVoucher");
let priceId = "";

async function getTicketByID(req, res) {
  const { name, id, eventId } = req.query;
  const { userId } = req.body;

  const allTickets = await Ticket.findAll();
  try {
    if (eventId) {
      const AllUserMatchIdEvent = await Ticket.findAll({
        where: { eventId: eventId },
      });
      const emails = [];
      AllUserMatchIdEvent.filter((e) => {
        if (!emails.find((a) => a === e.email)) emails.push(e.email);
      });
      console.log(emails);
      if (emails) {
        return res.send(emails);
      } else {
        return res.status(404).json({ error: "No hay emails en este evento" });
      }
    }
    if (name) {
      const nameUserOrder = allTickets.filter((n) =>
        n.userName.toLowerCase().includes(name.toLowerCase())
      );
      if (nameUserOrder.length >= 1) {
        return res.send(nameUserOrder);
      }
    }
    if (id) {
      const findTicketForID = await Ticket.findByPk(id, {
        include: [
          { model: User, as: "user" },
          { model: Events, as: "event" },
        ],
      });
      return res.json(findTicketForID);
    }
    if (userId) {
      const findTicketForIDEvent = allTickets.filter((ticket) => {
        if (ticket.userId === userId) return ticket;
      });
      return res.json(findTicketForIDEvent);
    }
    return res.json(allTickets);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

async function postTicket(req, res) {
  const { name, price, idEvent, idUser, quantity } = req.body;
  console.log("postTicket", name, price, idEvent, idUser, quantity)
  try {
    if (name && price && idEvent && idUser) {
      const saveEvent = await Events.findByPk(idEvent);
      const saveUser = await User.findByPk(idUser);
      const newTicket = []
      let i = 0;
      while(i !== quantity){
        let variable = await Ticket.create({
          name: name,
          price: price,
          eventId: idEvent,
          userId: idUser,
          eventName: saveEvent.name || "undefined",
          email: saveUser.email || "undefined",
          userName: saveUser.name || "undefined",
        })
       await ticketVoucher(variable.id)
       newTicket.push(variable)
        i++
      }
      res.json(newTicket);
    } else {
      res.status(401).send({ error: "Faltan datos" });
    }
  } catch (error) {
    res.status(401).send({ error: error.message });
  }
}

async function deleteTicket(req, res) {
  const { id } = req.body;
  try {
    const deletedTicket = await Ticket.destroy({
      where: {
        id: id,
      },
    });
    if (deletedTicket === 1) res.json({ message: "Ticket borrado con exito" });
    else res.json({ error: "Error al borrar el Ticket" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// async function postCreatEventAndPrice(req, res, next) {
//   try {
//     const findEvent = await Events.findAll();
//     for (let i = 4; i < 8; i++) {
//       const product = await stripe.products.create({
//         name: findEvent[i].name,
//         description: findEvent[i].description,
//         images: [findEvent[i].performerImage],
//       });
//       if (product) {
//         const findStock = await Events.findByPk(findEvent[i].id, {
//           include: [{ model: TicketStock, as: "stock" }],
//         });
//         if (findStock) {
//           const price1 = await stripe.prices.create({
//             product: product.id,
//             unit_amount: findStock.stock.streamingPrice * 100,
//             currency: "ars",
//           });
//           //logica de relacion de tablas price/idprice/event

//           const price2 = await stripe.prices.create({
//             product: product.id,
//             unit_amount: findStock.stock.vipPrice * 100,
//             currency: "ars",
//           });

//           const price3 = await stripe.prices.create({
//             product: product.id,
//             unit_amount: findStock.stock.generalLateralPrice * 100,
//             currency: "ars",
//           });

//           const price4 = await stripe.prices.create({
//             product: product.id,
//             unit_amount: findStock.stock.generalPrice * 100,
//             currency: "ars",
//           });

//           const price5 = await stripe.prices.create({
//             product: product.id,
//             unit_amount: findStock.stock.palcoPrice * 100,
//             currency: "ars",
//           });
//         } else {
//           console.log("Evento No tiene stock relacionado");
//         }
//       }
//     }
//   } catch (error) {
//     console.log(error);
//   }
// }

async function postCreatEventAndPrice(event) {
  try {
    const idStockEncotrado = await TicketStock.findByPk(event[0].stockId);
    const product = await stripe.products.create({
      name: event[0].name,
      description: event[0].description,
      images: [event[0].performerImage],
    });
    if (product) {
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: idStockEncotrado.streamingPrice * 100,
        currency: "ars",
      });
      await idStockEncotrado.update({idStreamingPrice: price.id})
      const price2 = await stripe.prices.create({
        product: product.id,
        unit_amount: idStockEncotrado.vipPrice * 100,
        currency: "ars",
      });
      await idStockEncotrado.update({idVipPrice: price2.id})
      const price3 = await stripe.prices.create({
        product: product.id,
        unit_amount: idStockEncotrado.generalLateralPrice * 100,
        currency: "ars",
      });
      await idStockEncotrado.update({idGeneralLateralPrice: price3.id})
      const price4 = await stripe.prices.create({
        product: product.id,
        unit_amount: idStockEncotrado.generalPrice * 100,
        currency: "ars",
      });
      await idStockEncotrado.update({idGeneralPrice: price4.id})
      const price5 = await stripe.prices.create({
        product: product.id,
        unit_amount: idStockEncotrado.palcoPrice * 100,
        currency: "ars",
      });
      await idStockEncotrado.update({idPalcoPrice: price5.id})
      return ("Todo salio bien")
    } else {
      console.log("Evento No tiene stock relacionado");
    }
  } catch (error) {
    console.log(error.message);
  }
}

async function postCheckout(req, res, next) {
  const { line_items } = req.body;
  const session = await stripe.checkout.sessions.create({
    line_items: line_items,
    mode: "payment",
    success_url: "http://localhost:3000/success?success=true",
    cancel_url: "http://localhost:3000/success?canceled=true",
  });
  console.log(session)
  res.json(session)
}

module.exports = {
  getTicketByID,
  postTicket,
  deleteTicket,
  postCreatEventAndPrice,
  postCheckout,
  // getRaro2
};
