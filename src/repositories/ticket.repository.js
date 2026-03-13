import { TicketDAO } from "../dao/ticket.dao.js";

const ticketDAO = new TicketDAO();

export class TicketRepository {
  async create(data) {
    return ticketDAO.create(data);
  }

  async getByCode(code) {
    return ticketDAO.findByCode(code);
  }
}
