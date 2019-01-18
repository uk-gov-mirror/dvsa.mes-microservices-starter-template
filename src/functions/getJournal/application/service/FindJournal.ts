import { getJournal } from '../../framework/aws/DynamoJournalRepository';
import { ExaminerWorkSchedule } from '../../../../common/domain/Journal';
import * as moment from 'moment';

export async function findJournal(staffNumber: string): Promise<ExaminerWorkSchedule | null> {
  const journalWrapper = await getJournal(staffNumber);

  if (!journalWrapper) {
    return null;
  }

  const journal: ExaminerWorkSchedule = journalWrapper.journal;
  const updatedJournal = updateDates(journal);

  return updatedJournal;
}

/**
 * Temporary measure that will make sure every slot is today.
 */
function updateDates(journal: ExaminerWorkSchedule): ExaminerWorkSchedule {
  return {
    ...journal,
    testSlots: journal.testSlots ? journal.testSlots.map(testSlot => (
      {
        ...testSlot,
        slotDetail: {
          ...testSlot.slotDetail,
          // @ts-ignore
          start: formatDateToToday(testSlot.slotDetail.start),
        },
      }
    )) : [],
  };
}

function formatDateToToday(date: string) {
  const now = moment();

  const oldTimeToday = moment(date)
    .date(now.date())
    .month(now.month())
    .year(now.year());

  return `${oldTimeToday.format(moment.HTML5_FMT.DATETIME_LOCAL_SECONDS)}+00:00`;
}
