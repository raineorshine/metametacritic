import fs from 'fs/promises'
import { expect, test } from 'vitest'
import spawn from 'spawn-please'

test('metameta', async () => {
  const outputFile = 'sample.metameta.csv'
  await fs.rm(outputFile, { force: true, recursive: true })
  await spawn('node', ['build/bin.js', 'sample.csv'])
  const output = await fs.readFile(outputFile, 'utf8')
  expect(output).toEqual(`publicationName,meanScore,favor,similarity,reviews
ABC News,89,0.315,0.635,2
Arizona Republic,80,0.225,0.725,2
Austin Chronicle,78,0.205,0.515,2
Chicago Sun-Times,81.5,0.24,0.56,2
Chicago Tribune,88,0.305,0.625,2
CineVue,60,0.4,0.6,1
Collider,74.5,0.17,0.79,2
Consequence,100,0.8,0.19999999999999996,1
Empire,80,0.6,0.4,1
Entertainment Weekly,91,0.335,0.625,2
Film Threat,80,0.6,0.4,1
IGN,80,0.225,0.525,2
IndieWire,91,0.335,0.625,2
LarsenOnFilm,88,0.305,0.625,2
Little White Lies,90,0.7,0.30000000000000004,1
Los Angeles Times,95,0.375,0.625,2
Movie Nation,75.5,0.18,0.75,2
New York Magazine (Vulture),80,0.225,0.525,2
Observer,94,0.365,0.565,2
Original-Cin,95.5,0.38,0.5800000000000001,2
Paste Magazine,81.5,0.24,0.5900000000000001,2
ReelViews,75,0.55,0.44999999999999996,1
RogerEbert.com,94,0.365,0.565,2
Rolling Stone,100,0.425,0.575,2
San Francisco Chronicle,87.5,0.3,0.5,2
Screen Daily,90,0.325,0.675,2
Screen Rant,80,0.225,0.625,2
Slant Magazine,75.5,0.18,0.5,2
Slashfilm,67.5,0.1,0.5,2
The A.V. Club,100,0.425,0.575,2
The Associated Press,88,0.305,0.625,2
The Atlantic,98,0.78,0.21999999999999997,1
The Film Stage,83,0.255,0.625,2
The Globe and Mail (Toronto),86.5,0.29,0.55,2
The Guardian,90,0.325,0.675,2
The Hollywood Reporter,85,0.275,0.725,2
The Independent,80,0.6,0.4,1
The Irish Times,100,0.425,0.575,2
The New York Times,95,0.375,0.625,2
The New Yorker,65,0.075,0.675,2
The Observer (UK),70,0.5,0.5,2
The Playlist,87,0.295,0.585,2
The Seattle Times,88,0.305,0.625,2
The Telegraph,100,0.425,0.575,2
TheWrap,94,0.365,0.635,2
Time,70,0.5,0.5,1
Total Film,90,0.325,0.675,2
Vanity Fair,85,0.275,0.475,2
Variety,80,0.225,0.625,2
BBC,100,0.05,0.95,1
Boston Globe,88,-0.07,0.9299999999999999,1
The Daily Beast,80,-0.15,0.85,1
Time Out,100,0.05,0.95,1
Vox,90,-0.05,0.95,1
Wall Street Journal,70,-0.25,0.75,1
Washington Post,100,0.05,0.95,1`)
})
