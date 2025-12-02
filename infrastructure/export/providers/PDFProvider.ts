import { IExportProvider } from '../interfaces/IExportProvider'
import { Testimony } from '@/domain/testimony/types'
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer'
import DOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'
import React from 'react'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  text: {
    marginBottom: 10,
    lineHeight: 1.5,
  },
  milestone: {
    marginBottom: 15,
    paddingLeft: 10,
    borderLeft: '2px solid #4F46E5',
  },
  milestoneTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
})

function sanitizeText(text: string): string {
  if (typeof window === 'undefined') {
    const window = new JSDOM('').window
    const purify = DOMPurify(window as any)
    return purify.sanitize(text, { ALLOWED_TAGS: [] })
  }
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] })
}

function TestimonyPDF({ testimony }: { testimony: Testimony }) {
  const renderContent = () => {
    switch (testimony.framework_type) {
      case 'before_encounter_after':
        const beaContent = testimony.content as any
        return (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Before</Text>
              <Text style={styles.text}>{sanitizeText(beaContent.before || '')}</Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Encounter</Text>
              <Text style={styles.text}>{sanitizeText(beaContent.encounter || '')}</Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>After</Text>
              <Text style={styles.text}>{sanitizeText(beaContent.after || '')}</Text>
            </View>
          </>
        )

      case 'life_timeline':
        const timelineContent = testimony.content as any
        return (
          <View style={styles.section}>
            {timelineContent.milestones?.map((milestone: any, index: number) => (
              <View key={index} style={styles.milestone}>
                <Text style={styles.milestoneTitle}>
                  {sanitizeText(milestone.age || `Milestone ${index + 1}`)}
                </Text>
                <Text style={styles.text}>
                  <Text style={{ fontWeight: 'bold' }}>Event: </Text>
                  {sanitizeText(milestone.event || '')}
                </Text>
                <Text style={styles.text}>
                  <Text style={{ fontWeight: 'bold' }}>Impact: </Text>
                  {sanitizeText(milestone.impact || '')}
                </Text>
              </View>
            ))}
          </View>
        )

      case 'seasons_of_growth':
        const seasonsContent = testimony.content as any
        return (
          <>
            {seasonsContent.seasons?.map((season: any, index: number) => (
              <View key={index} style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {sanitizeText(season.season || `Season ${index + 1}`)}
                </Text>
                <Text style={styles.text}>
                  <Text style={{ fontWeight: 'bold' }}>Challenges: </Text>
                  {sanitizeText(season.challenges || '')}
                </Text>
                <Text style={styles.text}>
                  <Text style={{ fontWeight: 'bold' }}>Growth: </Text>
                  {sanitizeText(season.growth || '')}
                </Text>
                <Text style={styles.text}>
                  <Text style={{ fontWeight: 'bold' }}>Lessons Learned: </Text>
                  {sanitizeText(season.lessons || '')}
                </Text>
              </View>
            ))}
          </>
        )

      case 'free_form':
        const freeFormContent = testimony.content as any
        return (
          <View style={styles.section}>
            <Text style={styles.text}>{sanitizeText(freeFormContent.narrative || '')}</Text>
          </View>
        )

      default:
        return <Text style={styles.text}>No content available</Text>
    }
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{sanitizeText(testimony.title)}</Text>
        {renderContent()}
      </Page>
    </Document>
  )
}

export class PDFProvider implements IExportProvider {
  async generate(testimony: Testimony): Promise<Buffer> {
    const doc = React.createElement(TestimonyPDF, { testimony })
    const buffer = await renderToBuffer(doc)
    return buffer
  }
}

