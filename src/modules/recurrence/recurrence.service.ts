import {Injectable} from '@nestjs/common'

@Injectable()
export class RecurrenceService {
  create() {
    return 'This action adds a new recurrence'
  }

  findAll() {
    return `This action returns all recurrence`
  }

  findOne(id: number) {
    return `This action returns a #${id} recurrence`
  }

  update(id: number) {
    return `This action updates a #${id} recurrence`
  }

  remove(id: number) {
    return `This action removes a #${id} recurrence`
  }
}
