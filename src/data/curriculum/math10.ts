import { section } from './types';

const M = 'mathematics';

export const MATH_10 = [
  section(M, 10, 'alg-trig', ['Алгебра: тригонометрия', 'Algebra: trigonometry'], [
    {
      id: 'm10-radians',
      title: ['Радианная мера угла. Единичная окружность', 'Radians and the unit circle'],
      intro: ['Угол в радианах — длина дуги единичной окружности, которую он вырезает. Полный оборот — 2π радиан.', 'An angle in radians is the length of the arc it cuts on the unit circle; a full turn is 2π radians.'],
      points: [
        ['Перевод', 'Converting', '180° = π рад, поэтому 1 рад ≈ 57,3°, 90° = π/2, 60° = π/3, 45° = π/4.', '180° = π rad, so 1 rad ≈ 57.3°, 90° = π/2, 60° = π/3, 45° = π/4.'],
        ['Синус и косинус любого угла', 'Sine and cosine of any angle', 'Поворачиваем точку (1; 0) на угол α: её координаты и есть (cos α; sin α).', 'Rotate the point (1, 0) by α: its coordinates are (cos α, sin α).'],
        ['Знаки по четвертям', 'Signs by quadrant', 'В I четверти всё положительно; во II положителен синус, в III — тангенс, в IV — косинус.', 'All are positive in I; in II sine, in III tangent, in IV cosine.'],
      ],
      formula: '180^\\circ = \\pi \\text{ рад}, \\quad \\sin^2\\alpha + \\cos^2\\alpha = 1',
      sim: { moment: 'moment_trig_circle' },
    },
    {
      id: 'm10-trig-formulas',
      title: ['Основные тригонометрические формулы', 'Key trigonometric identities'],
      intro: ['Несколько формул позволяют упрощать любые тригонометрические выражения и решать уравнения.', 'A handful of identities simplify any trigonometric expression and help solve equations.'],
      points: [
        ['Основные тождества', 'Basic identities', 'sin²α + cos²α = 1, tg α = sin α / cos α, 1 + tg²α = 1/cos²α.', 'sin²α + cos²α = 1, tan α = sin α / cos α, 1 + tan²α = 1/cos²α.'],
        ['Формулы сложения', 'Addition formulas', 'sin(α ± β) = sin α cos β ± cos α sin β; cos(α ± β) = cos α cos β ∓ sin α sin β.', 'sin(α ± β) = sin α cos β ± cos α sin β; cos(α ± β) = cos α cos β ∓ sin α sin β.'],
        ['Двойной угол', 'Double angle', 'sin 2α = 2 sin α cos α, cos 2α = cos²α − sin²α.', 'sin 2α = 2 sin α cos α, cos 2α = cos²α − sin²α.'],
        ['Формулы приведения', 'Reduction formulas', 'sin(π − α) = sin α, cos(π/2 − α) = sin α: углы больше 90° сводятся к острым.', 'sin(π − α) = sin α, cos(π/2 − α) = sin α: larger angles reduce to acute ones.'],
      ],
      formula: '\\sin 2\\alpha = 2\\sin\\alpha\\cos\\alpha',
      sim: { moment: 'moment_trig_circle' },
    },
    {
      id: 'm10-trig-functions',
      title: ['Тригонометрические функции и их графики', 'Trigonometric functions and graphs'],
      intro: ['y = sin x и y = cos x — волны с периодом 2π и значениями от −1 до 1. Ими описывают колебания, звук и переменный ток.', 'y = sin x and y = cos x are waves with period 2π and values between −1 and 1; they describe vibrations, sound and AC current.'],
      points: [
        ['Период', 'Period', 'sin(x + 2π) = sin x; у tg x период π.', 'sin(x + 2π) = sin x; tan x has period π.'],
        ['Чётность', 'Even and odd', 'cos x чётная (cos(−x) = cos x), sin x и tg x нечётные.', 'cos x is even, sin x and tan x are odd.'],
        ['Растяжения', 'Stretching', 'y = A sin(ωx + φ): A — амплитуда, период T = 2π/ω.', 'y = A sin(ωx + φ): A is the amplitude, the period is 2π/ω.'],
      ],
      formula: 'y = A\\sin(\\omega x + \\varphi), \\quad T = \\frac{2\\pi}{\\omega}',
      sim: { graph: 'sin' },
    },
    {
      id: 'm10-trig-equations',
      title: ['Тригонометрические уравнения', 'Trigonometric equations'],
      intro: ['Из-за периодичности у тригонометрических уравнений бесконечно много корней. Их записывают с параметром n ∈ ℤ.', 'Because the functions repeat, these equations have infinitely many roots, written with a parameter n ∈ ℤ.'],
      points: [
        ['sin x = a', 'sin x = a', 'x = (−1)ⁿ arcsin a + πn при |a| ≤ 1.', 'x = (−1)ⁿ arcsin a + πn for |a| ≤ 1.'],
        ['cos x = a', 'cos x = a', 'x = ± arccos a + 2πn при |a| ≤ 1.', 'x = ± arccos a + 2πn for |a| ≤ 1.'],
        ['tg x = a', 'tan x = a', 'x = arctg a + πn для любого a.', 'x = arctan a + πn for any a.'],
        ['Частные случаи', 'Special cases', 'sin x = 0 ⇒ x = πn; cos x = 0 ⇒ x = π/2 + πn.', 'sin x = 0 ⇒ x = πn; cos x = 0 ⇒ x = π/2 + πn.'],
      ],
      formula: '\\cos x = a \\;\\Rightarrow\\; x = \\pm\\arccos a + 2\\pi n',
      sim: { moment: 'moment_trig_circle' },
    },
  ]),
  section(M, 10, 'alg-roots', ['Алгебра: корни и степени', 'Algebra: roots and powers'], [
    {
      id: 'm10-nth-root',
      title: ['Корень n-й степени', 'The nth root'],
      intro: ['ⁿ√a — число, n-я степень которого равна a. Корень чётной степени извлекают только из неотрицательных чисел.', 'ⁿ√a is the number whose nth power is a; even roots exist only for non-negative numbers.'],
      points: [
        ['Примеры', 'Examples', '³√27 = 3, ⁴√16 = 2, ³√(−8) = −2.', '³√27 = 3, ⁴√16 = 2, ³√(−8) = −2.'],
        ['Свойства', 'Properties', 'ⁿ√(ab) = ⁿ√a · ⁿ√b, ⁿ√(aᵐ) = (ⁿ√a)ᵐ.', 'ⁿ√(ab) = ⁿ√a · ⁿ√b, ⁿ√(aᵐ) = (ⁿ√a)ᵐ.'],
        ['Иррациональные уравнения', 'Radical equations', 'Возводим обе части в степень и обязательно проверяем корни: могут появиться посторонние.', 'Raise both sides to a power and always check: extra roots can appear.'],
      ],
      formula: '\\sqrt[n]{a^m} = a^{m/n}',
      sim: { graph: 'sqrt' },
    },
    {
      id: 'm10-rational-powers',
      title: ['Степень с рациональным показателем. Степенная функция', 'Rational exponents. Power functions'],
      intro: ['Дробный показатель — это корень: a^(m/n) = ⁿ√(aᵐ). Свойства степеней остаются прежними.', 'A fractional exponent is a root: a^(m/n) = ⁿ√(aᵐ), and the power rules still apply.'],
      points: [
        ['Примеры', 'Examples', '8^(2/3) = (³√8)² = 4; 16^(−1/2) = 1/4.', '8^(2/3) = (³√8)² = 4; 16^(−1/2) = 1/4.'],
        ['Степенная функция', 'Power functions', 'y = xᵖ: при p > 1 растёт всё круче, при 0 < p < 1 — всё медленнее, при p < 0 — убывает.', 'y = xᵖ grows ever faster for p > 1, ever slower for 0 < p < 1, and falls for p < 0.'],
        ['Сравнение степеней', 'Comparing powers', 'При a > 1 большему показателю соответствует большее значение.', 'For a > 1 the larger exponent gives the larger value.'],
      ],
      formula: 'a^{\\frac{m}{n}} = \\sqrt[n]{a^m}',
      sim: { graph: 'power' },
    },
  ]),
  section(M, 10, 'geo-space', ['Геометрия: стереометрия', 'Geometry: solid geometry'], [
    {
      id: 'm10-axioms',
      title: ['Аксиомы стереометрии', 'Axioms of solid geometry'],
      intro: ['Стереометрия изучает фигуры в пространстве. Её основа — несколько очевидных утверждений о точках, прямых и плоскостях.', 'Solid geometry studies figures in space, starting from a few obvious statements about points, lines and planes.'],
      points: [
        ['Плоскость через три точки', 'Three points', 'Через три точки, не лежащие на одной прямой, проходит ровно одна плоскость — поэтому табурет на трёх ножках не качается.', 'Exactly one plane passes through three points not on a line, which is why a three-legged stool never wobbles.'],
        ['Прямая в плоскости', 'A line in a plane', 'Если две точки прямой лежат в плоскости, то и вся прямая лежит в ней.', 'If two points of a line lie in a plane, the whole line does.'],
        ['Пересечение плоскостей', 'Two planes', 'Две пересекающиеся плоскости имеют общую прямую.', 'Two intersecting planes share a line.'],
      ],
      sim: { solid: 'cuboid' },
    },
    {
      id: 'm10-parallel-space',
      title: ['Параллельность в пространстве', 'Parallels in space'],
      intro: ['В пространстве прямые бывают не только параллельными или пересекающимися, но и скрещивающимися — они не пересекаются и не параллельны.', 'In space lines can also be skew: they neither meet nor are parallel.'],
      points: [
        ['Скрещивающиеся прямые', 'Skew lines', 'Например, ребро пола и ребро потолка разных стен комнаты.', 'For example, a floor edge and a ceiling edge on different walls of a room.'],
        ['Прямая и плоскость', 'A line and a plane', 'Прямая параллельна плоскости, если она параллельна какой-нибудь прямой в этой плоскости.', 'A line is parallel to a plane if it is parallel to some line in that plane.'],
        ['Параллельные плоскости', 'Parallel planes', 'Две плоскости параллельны, если две пересекающиеся прямые одной параллельны другой.', 'Two planes are parallel if two crossing lines of one are parallel to the other.'],
      ],
      sim: { solid: 'cuboid' },
    },
    {
      id: 'm10-perpendicular-space',
      title: ['Перпендикулярность. Теорема о трёх перпендикулярах', 'Perpendicularity. Three perpendiculars'],
      intro: ['Прямая перпендикулярна плоскости, если она перпендикулярна любой прямой этой плоскости. Достаточно проверить две пересекающиеся.', 'A line is perpendicular to a plane if it is perpendicular to every line in it; checking two crossing lines is enough.'],
      points: [
        ['Перпендикуляр и наклонная', 'Perpendicular and oblique', 'Перпендикуляр короче любой наклонной из той же точки; проекция наклонной — её «тень».', 'The perpendicular is shorter than any oblique from the same point; the projection is its shadow.'],
        ['Теорема о трёх перпендикулярах', 'Three perpendiculars', 'Прямая в плоскости перпендикулярна наклонной тогда и только тогда, когда она перпендикулярна её проекции.', 'A line in the plane is perpendicular to an oblique exactly when it is perpendicular to its projection.'],
        ['Двугранный угол', 'Dihedral angle', 'Угол между полуплоскостями, измеряемый линейным углом.', 'The angle between two half-planes, measured by a linear angle.'],
      ],
      sim: { solid: 'pyramid' },
    },
    {
      id: 'm10-polyhedra',
      title: ['Многогранники: призма и пирамида', 'Polyhedra: prisms and pyramids'],
      intro: ['Многогранник — тело, ограниченное плоскими многоугольниками. Самые важные — призма и пирамида.', 'A polyhedron is a solid bounded by flat polygons; the key ones are prisms and pyramids.'],
      points: [
        ['Призма', 'Prism', 'Два равных параллельных основания, боковые грани — параллелограммы. Sбок = P · h для прямой призмы.', 'Two equal parallel bases and parallelogram sides; the lateral area of a right prism is P · h.'],
        ['Пирамида', 'Pyramid', 'Основание — многоугольник, боковые грани — треугольники с общей вершиной. У правильной Sбок = ½ P · l, где l — апофема.', 'A polygonal base with triangular faces meeting at a vertex; a regular one has lateral area ½ P · l, with l the slant height.'],
        ['Теорема Эйлера', 'Euler’s formula', 'Вершины − рёбра + грани = 2: у куба 8 − 12 + 6 = 2.', 'Vertices − edges + faces = 2: for a cube 8 − 12 + 6 = 2.'],
        ['Правильные многогранники', 'Platonic solids', 'Их всего пять: тетраэдр, куб, октаэдр, додекаэдр, икосаэдр.', 'There are only five: tetrahedron, cube, octahedron, dodecahedron, icosahedron.'],
      ],
      formula: 'V - E + F = 2',
      sim: { solid: 'prism' },
    },
  ]),
];
