import { useTranslation } from 'react-i18next'

import ExpandableSection from '@/components/ExpandableSection'
import InfoBox from '@/components/InfoBox'

type BytecodeExpandableSectionProps = {
  bytecode: string
}

const BytecodeExpandableSection = ({ bytecode }: BytecodeExpandableSectionProps) => {
  const { t } = useTranslation()

  return (
    <ExpandableSection sectionTitleClosed={t('Bytecode')} sectionTitleOpen={t('Bytecode')} centered>
      <InfoBox text={bytecode} wordBreak />
    </ExpandableSection>
  )
}

export default BytecodeExpandableSection
