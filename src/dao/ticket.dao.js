import { Ticket } from "../models/ticket.model.js";

export class TicketDAO {
  async create(data) {
    return Ticket.create(data);
  }

  async findByCode(code) {
    return Ticket.findOne({ code });
  }
}
