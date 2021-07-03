import {Test, TestingModule} from '@nestjs/testing'
import {ListsService} from './lists.service'
import {ListsRepo} from './lists.repository'

describe('ListsService', () => {
  let service: ListsService
  const listsRepo = {
    findDuplicates: jest.fn(),
    findExactTitle: jest.fn(),
    create: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ListsService, ListsRepo]
    })
      .overrideProvider(ListsRepo)
      .useValue(listsRepo)
      .compile()

    service = module.get<ListsService>(ListsService)
  })

  it('should return new list if no duplicate', async () => {
    const TEST_UID = 'test-uid'
    const TEST_TITLE = 'test'

    listsRepo.findDuplicates.mockResolvedValueOnce([])
    listsRepo.findExactTitle.mockResolvedValueOnce(undefined)

    listsRepo.create.mockImplementationOnce((uid: string, title: string) => {
      return Promise.resolve({
        author_uid: uid,
        title
      })
    })

    const result = await service.create(TEST_UID, TEST_TITLE).toPromise()

    expect(result).toEqual({
      author_uid: TEST_UID,
      title: TEST_TITLE
    })
  })

  it('should return new list if has has exact title', async () => {
    const TEST_UID = 'test-uid'
    const TEST_TITLE = 'test'
    const MOCK_EXACT_LIST = {
      author_uid: TEST_UID,
      title: TEST_TITLE
    }

    listsRepo.findDuplicates.mockResolvedValueOnce([])
    listsRepo.findExactTitle.mockResolvedValueOnce(MOCK_EXACT_LIST)

    listsRepo.create.mockImplementationOnce((uid: string, title: string) => {
      return Promise.resolve({
        author_uid: uid,
        title
      })
    })

    const result = await service.create(TEST_UID, TEST_TITLE).toPromise()

    expect(result).toEqual({
      author_uid: TEST_UID,
      title: `${TEST_TITLE} (1)`
    })
  })

  it('should return new duplicate title if has one duplicate', async () => {
    const TEST_UID = 'test-uid'
    const TEST_TITLE = 'test'
    const DUPLICATE_POSTFIX = '(1)'
    const MOCK_SIMILAR_LIST = {
      author_uid: TEST_UID,
      title: `${TEST_TITLE} ${DUPLICATE_POSTFIX}`
    }

    listsRepo.findDuplicates.mockResolvedValueOnce([MOCK_SIMILAR_LIST])

    listsRepo.create.mockImplementationOnce((uid: string, title: string) => {
      return Promise.resolve({
        author_uid: uid,
        title
      })
    })

    const result = await service.create(TEST_UID, TEST_TITLE).toPromise()

    expect(result).toEqual({
      author_uid: TEST_UID,
      title: `${TEST_TITLE} (2)`
    })
  })

  it('should return new duplicate title if has many duplicates', async () => {
    const TEST_UID = 'test-uid'

    listsRepo.findDuplicates.mockResolvedValueOnce([
      {author_uid: TEST_UID, title: 'test (9)'},
      {author_uid: TEST_UID, title: 'test (10)'}
    ])

    listsRepo.create.mockImplementationOnce((uid: string, title: string) => {
      return Promise.resolve({
        author_uid: uid,
        title
      })
    })

    const result = await service.create(TEST_UID, 'test').toPromise()

    expect(result).toEqual({
      author_uid: TEST_UID,
      title: `test (11)`
    })
  })

  it('should create next duplicate title for brokenlike duplicate title', async () => {
    const TEST_UID = 'test-uid'
    const TEST_TITLE = 'test (4)(2)'
    const MOCK_SIMILAR_LIST = {
      author_uid: TEST_UID,
      title: TEST_TITLE
    }

    listsRepo.findDuplicates.mockResolvedValueOnce([MOCK_SIMILAR_LIST])

    listsRepo.create.mockImplementationOnce((uid: string, title: string) => {
      return Promise.resolve({
        author_uid: uid,
        title
      })
    })

    const result = await service.create(TEST_UID, TEST_TITLE).toPromise()

    expect(result).toEqual({
      author_uid: TEST_UID,
      title: `${TEST_TITLE} (1)`
    })
  })
})
