# Section 4 Cut Modal Rendering Deep Audit

## Status

Read-only audit. No source files or assets were changed.

## Build

Build passed before this report was generated.

## Confirmed State

- PNG cut assets found: 25
- public/assets/cuts/iberico-loin.png exists: True
- public/assets/cuts/iberico-loin-roast.png exists: True

## Likely Fix Needed

Cut cards already use PNG images. The selected cut modal needs to derive its image from the active cut ID or receive the image source from the clicked card.

```text
assets/cuts/<cut-id>.png
```

## selectedCutsModal.js Image-Related Context

```text
---- lines 1-19 ----
1: import { assetPath } from "./assetPath.js";
2: import { producerCutLinks, producers } from "./catalogData.js";
3: const selectedCuts = {
4:   Ribeye: {
5:     eyebrow: "Selected Cut",
6:     title: "Ribeye",
7:     category: "Beef / Wagyu",
8:     image: assetPath("assets/cuts/ribeye.jpg"),
9:     description:
10:       "A richly marbled center-plate cut selected for depth, tenderness, and a refined eating profile.",
11:     service:
12:       "Best for high-heat searing, grilling, and premium steak service.",
13:     rows: [
14:       ["14107", "Ribeye", "3/12.5# AVG. ~ 38# CS"],
15:       ["24107", "Ribeye", "3/12.5# AVG. ~ 38# CS"],
16:       ["34107", "Ribeye", "3/12.5# AVG. ~ 38# CS"],
17:       ["37907", "Ribeye", "4/9# AVG. ~ 38# CS"],
18:       ["22402W", "Ribeye Lip Off", "2/14# AVG. ~ 28# CS"],
19:       ["22409T", "Ribeye Lip Off", "2/14# AVG. ~ 28# CS"],

---- lines 1-21 ----
1: import { assetPath } from "./assetPath.js";
2: import { producerCutLinks, producers } from "./catalogData.js";
3: const selectedCuts = {
4:   Ribeye: {
5:     eyebrow: "Selected Cut",
6:     title: "Ribeye",
7:     category: "Beef / Wagyu",
8:     image: assetPath("assets/cuts/ribeye.jpg"),
9:     description:
10:       "A richly marbled center-plate cut selected for depth, tenderness, and a refined eating profile.",
11:     service:
12:       "Best for high-heat searing, grilling, and premium steak service.",
13:     rows: [
14:       ["14107", "Ribeye", "3/12.5# AVG. ~ 38# CS"],
15:       ["24107", "Ribeye", "3/12.5# AVG. ~ 38# CS"],
16:       ["34107", "Ribeye", "3/12.5# AVG. ~ 38# CS"],
17:       ["37907", "Ribeye", "4/9# AVG. ~ 38# CS"],
18:       ["22402W", "Ribeye Lip Off", "2/14# AVG. ~ 28# CS"],
19:       ["22409T", "Ribeye Lip Off", "2/14# AVG. ~ 28# CS"],
20:       ["2240XA", "Rib Eye Roll Lip Off 7LB+", "3/10# AVG. ~ 30# CS"],
21:       ["2240XB", "Rib Eye Roll Lip Off 7LB+", "3/10# AVG. ~ 30# CS"],

---- lines 1-26 ----
1: import { assetPath } from "./assetPath.js";
2: import { producerCutLinks, producers } from "./catalogData.js";
3: const selectedCuts = {
4:   Ribeye: {
5:     eyebrow: "Selected Cut",
6:     title: "Ribeye",
7:     category: "Beef / Wagyu",
8:     image: assetPath("assets/cuts/ribeye.jpg"),
9:     description:
10:       "A richly marbled center-plate cut selected for depth, tenderness, and a refined eating profile.",
11:     service:
12:       "Best for high-heat searing, grilling, and premium steak service.",
13:     rows: [
14:       ["14107", "Ribeye", "3/12.5# AVG. ~ 38# CS"],
15:       ["24107", "Ribeye", "3/12.5# AVG. ~ 38# CS"],
16:       ["34107", "Ribeye", "3/12.5# AVG. ~ 38# CS"],
17:       ["37907", "Ribeye", "4/9# AVG. ~ 38# CS"],
18:       ["22402W", "Ribeye Lip Off", "2/14# AVG. ~ 28# CS"],
19:       ["22409T", "Ribeye Lip Off", "2/14# AVG. ~ 28# CS"],
20:       ["2240XA", "Rib Eye Roll Lip Off 7LB+", "3/10# AVG. ~ 30# CS"],
21:       ["2240XB", "Rib Eye Roll Lip Off 7LB+", "3/10# AVG. ~ 30# CS"],
22:     ],
23:   },
24:   Tenderloin: {
25:     eyebrow: "Selected Cut",
26:     title: "Tenderloin",

---- lines 18-46 ----
18:       ["22402W", "Ribeye Lip Off", "2/14# AVG. ~ 28# CS"],
19:       ["22409T", "Ribeye Lip Off", "2/14# AVG. ~ 28# CS"],
20:       ["2240XA", "Rib Eye Roll Lip Off 7LB+", "3/10# AVG. ~ 30# CS"],
21:       ["2240XB", "Rib Eye Roll Lip Off 7LB+", "3/10# AVG. ~ 30# CS"],
22:     ],
23:   },
24:   Tenderloin: {
25:     eyebrow: "Selected Cut",
26:     title: "Tenderloin",
27:     category: "Beef / Wagyu / Pork",
28:     image: assetPath("assets/cuts/tenderloin.jpg"),
29:     description:
30:       "A refined, tender cut selected for clean presentation, delicate texture, and elegant service.",
31:     service:
32:       "Best for fine-dining portions, pan searing, roasting, and composed plates.",
33:     rows: [
34:       ["14135", "Tenderloin", "4/5.5# AVG. ~ 22# CS"],
35:       ["24135", "Tenderloin", "4/5.5# AVG. ~ 22# CS"],
36:       ["34135", "Tenderloin", "4/5.5# AVG. ~ 22# CS"],
37:       ["37905", "Tenderloin", "4/7# AVG. ~ 30# CS"],
38:       ["FP18", "Tenderloin", "24/0.8# AVG. ~ 19.2# CS"],
39:       ["21602W", "Tenderloin SS Off", "6/5# AVG. ~ 30# CS"],
40:       ["21609T", "Tenderloin SS Off", "6/5# AVG. ~ 30# CS"],
41:       ["2160XA", "Tenderloin SS Off 4LB+", "6/4# AVG. ~ 24# CS"],
42:       ["2160XB", "Tenderloin SS Off 4LB+", "6/4# AVG. ~ 24# CS"],
43:     ],
44:   },
45:   Striploin: {
46:     eyebrow: "Selected Cut",

---- lines 39-67 ----
39:       ["21602W", "Tenderloin SS Off", "6/5# AVG. ~ 30# CS"],
40:       ["21609T", "Tenderloin SS Off", "6/5# AVG. ~ 30# CS"],
41:       ["2160XA", "Tenderloin SS Off 4LB+", "6/4# AVG. ~ 24# CS"],
42:       ["2160XB", "Tenderloin SS Off 4LB+", "6/4# AVG. ~ 24# CS"],
43:     ],
44:   },
45:   Striploin: {
46:     eyebrow: "Selected Cut",
47:     title: "Striploin",
48:     category: "Beef / Wagyu",
49:     image: assetPath("assets/cuts/striploin.jpg"),
50:     description:
51:       "A classic premium steak cut selected for balance, marbling, and a confident center-plate profile.",
52:     service:
53:       "Best for steaks, portioning, grilling, and refined steakhouse service.",
54:     rows: [
55:       ["14104", "Striploin", "3/13# AVG. ~ 40# CS"],
56:       ["24104", "Striploin", "3/13# AVG. ~ 40# CS"],
57:       ["34104", "Striploin", "3/13# AVG. ~ 40# CS"],
58:       ["37904", "Striploin", "2/19# AVG. ~ 37# CS"],
59:       ["37974", "Bone-In Striploin", "1/40# AVG. ~ 40# CS"],
60:       ["21402W", "Striploin", "2/15# AVG. ~ 30# CS"],
61:       ["21409T", "Striploin", "2/15# AVG. ~ 30# CS"],
62:       ["2140XA", "Striploin 11LB+", "3/12# AVG. ~ 36# CS"],
63:       ["1562XA", "B/In Striploin Vac", "3/12# AVG. ~ 36# CS"],
64:       ["2140XB", "Striploin 11LB+", "3/12# AVG. ~ 36# CS"],
65:       ["1562XB", "Striploin B/I", "2/16# AVG. ~ 32# CS"],
66:     ],
67:   },

---- lines 62-90 ----
62:       ["2140XA", "Striploin 11LB+", "3/12# AVG. ~ 36# CS"],
63:       ["1562XA", "B/In Striploin Vac", "3/12# AVG. ~ 36# CS"],
64:       ["2140XB", "Striploin 11LB+", "3/12# AVG. ~ 36# CS"],
65:       ["1562XB", "Striploin B/I", "2/16# AVG. ~ 32# CS"],
66:     ],
67:   },
68:   Tomahawk: {
69:     eyebrow: "Selected Cut",
70:     title: "Tomahawk",
71:     category: "Beef / Wagyu",
72:     image: assetPath("assets/cuts/tomahawk.jpg"),
73:     description:
74:       "A dramatic bone-in cut selected for visual impact, rich flavor, and celebratory presentation.",
75:     service:
76:       "Best for sharing portions, grilling, roasting, and high-impact menu features.",
77:     rows: [
78:       ["14101", "Tomahawk", "2/11# AVG. ~ 22# CS"],
79:       ["24101", "Tomahawk", "2/11# AVG. ~ 22# CS"],
80:       ["34101", "Tomahawk", "2/11# AVG. ~ 22# CS"],
81:       ["27972", "Tomahawk", "1/22# AVG. ~ 22# CS"],
82:       ["37972", "Tomahawk", "1/22# AVG. ~ 22# CS"],
83:       ["1602TW", "Tomahawk", "2/12# AVG. ~ 24# CS"],
84:       ["1602RW", "Tomahawk", "2/12# AVG. ~ 24# CS"],
85:     ],
86:   },
87:   Presa: {
88:     eyebrow: "Selected Cut",
89:     title: "Presa",
90:     category: "Ibérico Pork",

---- lines 81-109 ----
81:       ["27972", "Tomahawk", "1/22# AVG. ~ 22# CS"],
82:       ["37972", "Tomahawk", "1/22# AVG. ~ 22# CS"],
83:       ["1602TW", "Tomahawk", "2/12# AVG. ~ 24# CS"],
84:       ["1602RW", "Tomahawk", "2/12# AVG. ~ 24# CS"],
85:     ],
86:   },
87:   Presa: {
88:     eyebrow: "Selected Cut",
89:     title: "Presa",
90:     category: "Ibérico Pork",
91:     image: assetPath("assets/cuts/presa.jpg"),
92:     description:
93:       "A highly regarded Ibérico cut selected for deep flavor, tenderness, and generous marbling.",
94:     service:
95:       "Best for grilling, searing, slicing, and Spanish-inspired center-plate service.",
96:     rows: [["FP02", "Presa", "12/1.54# AVG. ~ 18.5# CS"]],
97:   },
98:   Secreto: {
99:     eyebrow: "Selected Cut",
100:     title: "Secreto",
101:     category: "Ibérico Pork",
102:     image: assetPath("assets/cuts/secreto.jpg"),
103:     description:
104:       "A richly marbled Ibérico cut selected for expressive flavor, quick cooking, and delicate texture.",
105:     service:
106:       "Best for hot searing, charcoal grilling, slicing, and small-plate service.",
107:     rows: [
108:       ["FP01", "Secreto", "16/1.1# AVG. ~ 17.5# CS"],
109:       ["FP15", "Jowl Secreto", "16/0.5# AVG. ~ 8# CS"],

---- lines 92-120 ----
92:     description:
93:       "A highly regarded Ibérico cut selected for deep flavor, tenderness, and generous marbling.",
94:     service:
95:       "Best for grilling, searing, slicing, and Spanish-inspired center-plate service.",
96:     rows: [["FP02", "Presa", "12/1.54# AVG. ~ 18.5# CS"]],
97:   },
98:   Secreto: {
99:     eyebrow: "Selected Cut",
100:     title: "Secreto",
101:     category: "Ibérico Pork",
102:     image: assetPath("assets/cuts/secreto.jpg"),
103:     description:
104:       "A richly marbled Ibérico cut selected for expressive flavor, quick cooking, and delicate texture.",
105:     service:
106:       "Best for hot searing, charcoal grilling, slicing, and small-plate service.",
107:     rows: [
108:       ["FP01", "Secreto", "16/1.1# AVG. ~ 17.5# CS"],
109:       ["FP15", "Jowl Secreto", "16/0.5# AVG. ~ 8# CS"],
110:       ["FP16", "Belly Secreto", "14/1.3# AVG. ~ 18# CS"],
111:     ],
112:   },
113:   "Rump Cap": {
114:     eyebrow: "Selected Cut",
115:     title: "Picanha",
116:     category: "Beef / Wagyu",
117:     image: assetPath("assets/cuts/rump-cap.jpg"),
118:     description:
119:       "A flavorful cap cut selected for its fat cover, rich character, and versatile presentation.",
120:     service:

---- lines 107-135 ----
107:     rows: [
108:       ["FP01", "Secreto", "16/1.1# AVG. ~ 17.5# CS"],
109:       ["FP15", "Jowl Secreto", "16/0.5# AVG. ~ 8# CS"],
110:       ["FP16", "Belly Secreto", "14/1.3# AVG. ~ 18# CS"],
111:     ],
112:   },
113:   "Rump Cap": {
114:     eyebrow: "Selected Cut",
115:     title: "Picanha",
116:     category: "Beef / Wagyu",
117:     image: assetPath("assets/cuts/rump-cap.jpg"),
118:     description:
119:       "A flavorful cap cut selected for its fat cover, rich character, and versatile presentation.",
120:     service:
121:       "Best for roasting, grilling, slicing, and picanha-style service.",
122:     rows: [
123:       ["24124", "Rump Cap", "8/3.5# AVG. ~ 28# CS"],
124:       ["34124", "Rump Cap", "8/3.5# AVG. ~ 28# CS"],
125:       ["37924", "Rump Cap (Culotte)", "8/4# AVG. ~ 34# CS"],
126:       ["2091XA", "Rump Cap", "6/5# AVG. ~ 30# CS"],
127:       ["2091XB", "Rump Cap", "6/5# AVG. ~ 30# CS"],
128:     ],
129:   },
130:   "Short Rib": {
131:     eyebrow: "Selected Cut",
132:     title: "Short Rib",
133:     category: "Beef",
134:     image: assetPath("assets/cuts/short-rib.jpg"),
135:     description:

---- lines 124-152 ----
124:       ["34124", "Rump Cap", "8/3.5# AVG. ~ 28# CS"],
125:       ["37924", "Rump Cap (Culotte)", "8/4# AVG. ~ 34# CS"],
126:       ["2091XA", "Rump Cap", "6/5# AVG. ~ 30# CS"],
127:       ["2091XB", "Rump Cap", "6/5# AVG. ~ 30# CS"],
128:     ],
129:   },
130:   "Short Rib": {
131:     eyebrow: "Selected Cut",
132:     title: "Short Rib",
133:     category: "Beef",
134:     image: assetPath("assets/cuts/short-rib.jpg"),
135:     description:
136:       "A richly flavored cut selected for depth, structure, and satisfying slow-cooked or grilled preparations.",
137:     service:
138:       "Best for braising, smoking, grilling, and Korean-style short rib service.",
139:     rows: [
140:       ["1688XA", "Short Rib 3-Rib", "12/4# AVG. ~ 48# CS"],
141:       ["1688XB", "Short Rib 3-Rib", "8/3# AVG. ~ 48# CS"],
142:     ],
143:   },
144:   "Chuck Roll": {
145:     eyebrow: "Selected Cut",
146:     title: "Chuck Roll",
147:     category: "Wagyu",
148:     image: assetPath("assets/cuts/placeholder-cut.svg"),
149:     description:
150:       "A versatile forequarter cut selected for depth, structure, and a generous flavor profile.",
151:     service:
152:       "Best for roasting, braising, slicing, and refined slow-cooked preparations.",

---- lines 138-166 ----
138:       "Best for braising, smoking, grilling, and Korean-style short rib service.",
139:     rows: [
140:       ["1688XA", "Short Rib 3-Rib", "12/4# AVG. ~ 48# CS"],
141:       ["1688XB", "Short Rib 3-Rib", "8/3# AVG. ~ 48# CS"],
142:     ],
143:   },
144:   "Chuck Roll": {
145:     eyebrow: "Selected Cut",
146:     title: "Chuck Roll",
147:     category: "Wagyu",
148:     image: assetPath("assets/cuts/placeholder-cut.svg"),
149:     description:
150:       "A versatile forequarter cut selected for depth, structure, and a generous flavor profile.",
151:     service:
152:       "Best for roasting, braising, slicing, and refined slow-cooked preparations.",
153:     rows: [
154:       ["34129", "Chuck Roll", "2/20# AVG. ~ 40# CS"],
155:     ],
156:   },
157:   "Shortloin": {
158:     eyebrow: "Selected Cut",
159:     title: "Shortloin",
160:     category: "Wagyu",
161:     image: assetPath("assets/cuts/placeholder-cut.svg"),
162:     description:
163:       "A premium loin section selected for steakhouse utility, balance, and elegant portioning.",
164:     service:
165:       "Best for portioning into high-value steaks, roasting, and composed center-plate service.",
166:     rows: [

---- lines 151-179 ----
151:     service:
152:       "Best for roasting, braising, slicing, and refined slow-cooked preparations.",
153:     rows: [
154:       ["34129", "Chuck Roll", "2/20# AVG. ~ 40# CS"],
155:     ],
156:   },
157:   "Shortloin": {
158:     eyebrow: "Selected Cut",
159:     title: "Shortloin",
160:     category: "Wagyu",
161:     image: assetPath("assets/cuts/placeholder-cut.svg"),
162:     description:
163:       "A premium loin section selected for steakhouse utility, balance, and elegant portioning.",
164:     service:
165:       "Best for portioning into high-value steaks, roasting, and composed center-plate service.",
166:     rows: [
167:       ["24105", "Shortloin", "1/28# AVG. ~ 28# CS"],
168:       ["37975", "Shortloin", "1/22# AVG. ~ 22# CS"],
169:     ],
170:   },
171:   "Flap Meat": {
172:     eyebrow: "Selected Cut",
173:     title: "Flap Meat",
174:     category: "Beef / Wagyu",
175:     image: assetPath("assets/cuts/placeholder-cut.svg"),
176:     description:
177:       "A flavorful, loose-grained cut selected for marbling, quick cooking, and strong menu versatility.",
178:     service:
179:       "Best for grilling, searing, slicing across the grain, and bold steak preparations.",

---- lines 165-193 ----
165:       "Best for portioning into high-value steaks, roasting, and composed center-plate service.",
166:     rows: [
167:       ["24105", "Shortloin", "1/28# AVG. ~ 28# CS"],
168:       ["37975", "Shortloin", "1/22# AVG. ~ 22# CS"],
169:     ],
170:   },
171:   "Flap Meat": {
172:     eyebrow: "Selected Cut",
173:     title: "Flap Meat",
174:     category: "Beef / Wagyu",
175:     image: assetPath("assets/cuts/placeholder-cut.svg"),
176:     description:
177:       "A flavorful, loose-grained cut selected for marbling, quick cooking, and strong menu versatility.",
178:     service:
179:       "Best for grilling, searing, slicing across the grain, and bold steak preparations.",
180:     rows: [
181:       ["14117", "Flap Meat", "8/4.5# AVG. ~ 36# CS"],
182:       ["24117", "Flap Meat", "8/4.5# AVG. ~ 36# CS"],
183:       ["34117", "Flap Meat", "8/4.5# AVG. ~ 36# CS"],
184:       ["37917", "Flap Meat", "8/4# AVG. ~ 35# CS"],
185:       ["22061W", "Flap Meat", "6/5# AVG. ~ 30# CS"],
186:       ["2206XA", "Flap Meat", "6/2.5# AVG. ~ 30# CS"],
187:     ],
188:   },
189:   "Flank Steak": {
190:     eyebrow: "Selected Cut",
191:     title: "Flank Steak",
192:     category: "Beef / Ibérico Pork",
193:     image: assetPath("assets/cuts/placeholder-cut.svg"),

---- lines 183-211 ----
183:       ["34117", "Flap Meat", "8/4.5# AVG. ~ 36# CS"],
184:       ["37917", "Flap Meat", "8/4# AVG. ~ 35# CS"],
185:       ["22061W", "Flap Meat", "6/5# AVG. ~ 30# CS"],
186:       ["2206XA", "Flap Meat", "6/2.5# AVG. ~ 30# CS"],
187:     ],
188:   },
189:   "Flank Steak": {
190:     eyebrow: "Selected Cut",
191:     title: "Flank Steak",
192:     category: "Beef / Ibérico Pork",
193:     image: assetPath("assets/cuts/placeholder-cut.svg"),
194:     description:
195:       "A lean, expressive cut selected for clean slicing, defined texture, and focused flavor.",
196:     service:
197:       "Best for high-heat grilling, marinades, slicing, and shareable plates.",
198:     rows: [
199:       ["FP10", "Flank Steak", "18/1.2# AVG. ~ 21# CS"],
200:       ["2210XA", "Flank Steak", "12/1.5# AVG. ~ 36# CS"],
201:     ],
202:   },
203:   "Tri Tip": {
204:     eyebrow: "Selected Cut",
205:     title: "Tri Tip",
206:     category: "Beef / Wagyu",
207:     image: assetPath("assets/cuts/placeholder-cut.svg"),
208:     description:
209:       "A compact sirloin cut selected for roastability, flavor concentration, and broad service flexibility.",
210:     service:
211:       "Best for roasting, grilling, carving, and premium sliced presentations.",

---- lines 197-225 ----
197:       "Best for high-heat grilling, marinades, slicing, and shareable plates.",
198:     rows: [
199:       ["FP10", "Flank Steak", "18/1.2# AVG. ~ 21# CS"],
200:       ["2210XA", "Flank Steak", "12/1.5# AVG. ~ 36# CS"],
201:     ],
202:   },
203:   "Tri Tip": {
204:     eyebrow: "Selected Cut",
205:     title: "Tri Tip",
206:     category: "Beef / Wagyu",
207:     image: assetPath("assets/cuts/placeholder-cut.svg"),
208:     description:
209:       "A compact sirloin cut selected for roastability, flavor concentration, and broad service flexibility.",
210:     service:
211:       "Best for roasting, grilling, carving, and premium sliced presentations.",
212:     rows: [
213:       ["14116", "Tri Tip", "16/2.25# AVG. ~ 36# CS"],
214:       ["24116", "Tri Tip", "16/2.25# AVG. ~ 36# CS"],
215:       ["34116", "Tri Tip", "16/2.25# AVG. ~ 36# CS"],
216:       ["37916", "Tri Tip", "12/3# AVG. ~ 33# CS"],
217:       ["21311W", "Tri Tip", "12/3# AVG. ~ 36# CS"],
218:       ["2131XA", "Tri Tip", "4/2# AVG. ~ 32# CS"],
219:     ],
220:   },
221:   "Top Sirloin": {
222:     eyebrow: "Selected Cut",
223:     title: "Top Sirloin",
224:     category: "Beef / Wagyu",
225:     image: assetPath("assets/cuts/placeholder-cut.svg"),

---- lines 215-243 ----
215:       ["34116", "Tri Tip", "16/2.25# AVG. ~ 36# CS"],
216:       ["37916", "Tri Tip", "12/3# AVG. ~ 33# CS"],
217:       ["21311W", "Tri Tip", "12/3# AVG. ~ 36# CS"],
218:       ["2131XA", "Tri Tip", "4/2# AVG. ~ 32# CS"],
219:     ],
220:   },
221:   "Top Sirloin": {
222:     eyebrow: "Selected Cut",
223:     title: "Top Sirloin",
224:     category: "Beef / Wagyu",
225:     image: assetPath("assets/cuts/placeholder-cut.svg"),
226:     description:
227:       "A reliable premium cut selected for lean structure, clean flavor, and adaptable service.",
228:     service:
229:       "Best for steaks, grilling, roasting, and consistent portion control.",
230:     rows: [
231:       ["24123", "Top Sirloin", "4/8# AVG. ~ 32# CS"],
232:       ["34123", "Top Sirloin", "4/8# AVG. ~ 32# CS"],
233:       ["21102W", "Top Sirloin", "3/16# AVG. ~ 48# CS"],
234:       ["2110XA", "Top Sirloin", "6/6# AVG. ~ 36# CS"],
235:       ["2110XB", "Top Sirloin", "6/6# AVG. ~ 36# CS"],
236:     ],
237:   },
238:   "Oyster Blade": {
239:     eyebrow: "Selected Cut",
240:     title: "Oyster Blade",
241:     category: "Wagyu",
242:     image: assetPath("assets/cuts/placeholder-cut.svg"),
243:     description:

---- lines 232-260 ----
232:       ["34123", "Top Sirloin", "4/8# AVG. ~ 32# CS"],
233:       ["21102W", "Top Sirloin", "3/16# AVG. ~ 48# CS"],
234:       ["2110XA", "Top Sirloin", "6/6# AVG. ~ 36# CS"],
235:       ["2110XB", "Top Sirloin", "6/6# AVG. ~ 36# CS"],
236:     ],
237:   },
238:   "Oyster Blade": {
239:     eyebrow: "Selected Cut",
240:     title: "Oyster Blade",
241:     category: "Wagyu",
242:     image: assetPath("assets/cuts/placeholder-cut.svg"),
243:     description:
244:       "A shoulder cut selected for tenderness potential, rich flavor, and refined preparation range.",
245:     service:
246:       "Best for slow cooking, roasting, slicing, and carefully trimmed steak applications.",
247:     rows: [
248:       ["37932", "Oyster Blade", "8/6# AVG. ~ 49# CS"],
249:     ],
250:   },
251:   "Chuck Tail Flap": {
252:     eyebrow: "Selected Cut",
253:     title: "Chuck Tail Flap",
254:     category: "Beef / Wagyu",
255:     image: assetPath("assets/cuts/placeholder-cut.svg"),
256:     description:
257:       "A deeply flavored cut selected for marbling, texture, and strong culinary flexibility.",
258:     service:
259:       "Best for grilling, searing, slicing, and rich center-plate features.",
260:     rows: [

---- lines 245-273 ----
245:     service:
246:       "Best for slow cooking, roasting, slicing, and carefully trimmed steak applications.",
247:     rows: [
248:       ["37932", "Oyster Blade", "8/6# AVG. ~ 49# CS"],
249:     ],
250:   },
251:   "Chuck Tail Flap": {
252:     eyebrow: "Selected Cut",
253:     title: "Chuck Tail Flap",
254:     category: "Beef / Wagyu",
255:     image: assetPath("assets/cuts/placeholder-cut.svg"),
256:     description:
257:       "A deeply flavored cut selected for marbling, texture, and strong culinary flexibility.",
258:     service:
259:       "Best for grilling, searing, slicing, and rich center-plate features.",
260:     rows: [
261:       ["14142", "Chuck Tail Flap", "3/13# AVG. ~ 40# CS"],
262:       ["24142", "Chuck Tail Flap", "12/2.5# AVG. ~ 30# CS"],
263:       ["34142", "Chuck Tail Flap", "12/2.5# AVG. ~ 30# CS"],
264:       ["37942", "Chuck Tail Flap", "12/3# AVG. ~ 35# CS"],
265:       ["2266GS", "Chuck Tail Flap", "5/7# AVG. ~ 35# CS"],
266:     ],
267:   },
268:   "Iberico Abanico": {
269:     eyebrow: "Selected Cut",
270:     title: "Iberico Abanico",
271:     category: "Ibérico Pork",
272:     image: assetPath("assets/cuts/placeholder-cut.svg"),
273:     description:

---- lines 262-290 ----
262:       ["24142", "Chuck Tail Flap", "12/2.5# AVG. ~ 30# CS"],
263:       ["34142", "Chuck Tail Flap", "12/2.5# AVG. ~ 30# CS"],
264:       ["37942", "Chuck Tail Flap", "12/3# AVG. ~ 35# CS"],
265:       ["2266GS", "Chuck Tail Flap", "5/7# AVG. ~ 35# CS"],
266:     ],
267:   },
268:   "Iberico Abanico": {
269:     eyebrow: "Selected Cut",
270:     title: "Iberico Abanico",
271:     category: "Ibérico Pork",
272:     image: assetPath("assets/cuts/placeholder-cut.svg"),
273:     description:
274:       "A prized Ibérico cut selected for expressive marbling, rich flavor, and refined Spanish character.",
275:     service:
276:       "Best for high-heat searing, charcoal grilling, slicing, and premium shared plates.",
277:     rows: [
278:       ["FP03", "Albanico", "18/1.1# AVG. ~ 19.8# CS"],
279:     ],
280:   },
281:   "Iberico Pluma": {
282:     eyebrow: "Selected Cut",
283:     title: "Iberico Pluma",
284:     category: "Ibérico Pork",
285:     image: assetPath("assets/cuts/placeholder-cut.svg"),
286:     description:
287:       "A delicate Ibérico cut selected for tenderness, elegant fat distribution, and a clean finishing profile.",
288:     service:
289:       "Best for grilling, searing, slicing thinly, and refined small-plate service.",
290:     rows: [

---- lines 275-303 ----
275:     service:
276:       "Best for high-heat searing, charcoal grilling, slicing, and premium shared plates.",
277:     rows: [
278:       ["FP03", "Albanico", "18/1.1# AVG. ~ 19.8# CS"],
279:     ],
280:   },
281:   "Iberico Pluma": {
282:     eyebrow: "Selected Cut",
283:     title: "Iberico Pluma",
284:     category: "Ibérico Pork",
285:     image: assetPath("assets/cuts/placeholder-cut.svg"),
286:     description:
287:       "A delicate Ibérico cut selected for tenderness, elegant fat distribution, and a clean finishing profile.",
288:     service:
289:       "Best for grilling, searing, slicing thinly, and refined small-plate service.",
290:     rows: [
291:       ["FP04", "Pluma", "12/1.5# AVG. ~ 18.5# CS"],
292:     ],
293:   },
294:   "Iberico Coppa": {
295:     eyebrow: "Selected Cut",
296:     title: "Iberico Coppa",
297:     category: "Ibérico Pork",
298:     image: assetPath("assets/cuts/placeholder-cut.svg"),
299:     description:
300:       "A deeply flavored shoulder cut selected for marbling, structure, and generous culinary versatility.",
301:     service:
302:       "Best for roasting, slow cooking, slicing, and rich center-plate preparations.",
303:     rows: [

---- lines 288-316 ----
288:     service:
289:       "Best for grilling, searing, slicing thinly, and refined small-plate service.",
290:     rows: [
291:       ["FP04", "Pluma", "12/1.5# AVG. ~ 18.5# CS"],
292:     ],
293:   },
294:   "Iberico Coppa": {
295:     eyebrow: "Selected Cut",
296:     title: "Iberico Coppa",
297:     category: "Ibérico Pork",
298:     image: assetPath("assets/cuts/placeholder-cut.svg"),
299:     description:
300:       "A deeply flavored shoulder cut selected for marbling, structure, and generous culinary versatility.",
301:     service:
302:       "Best for roasting, slow cooking, slicing, and rich center-plate preparations.",
303:     rows: [
304:       ["FP08", "Coppa", "8/2.3# AVG. ~ 18# CS"],
305:     ],
306:   },
307:   "Iberico Loin Roast": {
308:     eyebrow: "Selected Cut",
309:     title: "Iberico Loin Roast",
310:     category: "Ibérico Pork",
311:     image: assetPath("assets/cuts/placeholder-cut.svg"),
312:     description:
313:       "A refined Ibérico roast selected for balanced texture, clean presentation, and understated richness.",
314:     service:
315:       "Best for roasting, carving, composed plates, and elegant banquet-style service.",
316:     rows: [

---- lines 301-329 ----
301:     service:
302:       "Best for roasting, slow cooking, slicing, and rich center-plate preparations.",
303:     rows: [
304:       ["FP08", "Coppa", "8/2.3# AVG. ~ 18# CS"],
305:     ],
306:   },
307:   "Iberico Loin Roast": {
308:     eyebrow: "Selected Cut",
309:     title: "Iberico Loin Roast",
310:     category: "Ibérico Pork",
311:     image: assetPath("assets/cuts/placeholder-cut.svg"),
312:     description:
313:       "A refined Ibérico roast selected for balanced texture, clean presentation, and understated richness.",
314:     service:
315:       "Best for roasting, carving, composed plates, and elegant banquet-style service.",
316:     rows: [
317:       ["FP07", "Loin Roast", "12/1.25# AVG. ~ 15# CS"],
318:     ],
319:   },
320:   "Iberico 4 Rib-Rack": {
321:     eyebrow: "Selected Cut",
322:     title: "Iberico 4 Rib-Rack",
323:     category: "Ibérico Pork",
324:     image: assetPath("assets/cuts/placeholder-cut.svg"),
325:     description:
326:       "A presentation-focused Ibérico rack selected for visual impact, marbling, and heritage pork flavor.",
327:     service:
328:       "Best for roasting, grilling, carving tableside, and premium menu features.",
329:     rows: [

---- lines 314-342 ----
314:     service:
315:       "Best for roasting, carving, composed plates, and elegant banquet-style service.",
316:     rows: [
317:       ["FP07", "Loin Roast", "12/1.25# AVG. ~ 15# CS"],
318:     ],
319:   },
320:   "Iberico 4 Rib-Rack": {
321:     eyebrow: "Selected Cut",
322:     title: "Iberico 4 Rib-Rack",
323:     category: "Ibérico Pork",
324:     image: assetPath("assets/cuts/placeholder-cut.svg"),
325:     description:
326:       "A presentation-focused Ibérico rack selected for visual impact, marbling, and heritage pork flavor.",
327:     service:
328:       "Best for roasting, grilling, carving tableside, and premium menu features.",
329:     rows: [
330:       ["FP05", "4-Rib Rack", "6/2.1# AVG. ~ 13# CS"],
331:     ],
332:   },
333:   "Iberico St. Louis Ribs": {
334:     eyebrow: "Selected Cut",
335:     title: "Iberico St. Louis Ribs",
336:     category: "Ibérico Pork",
337:     image: assetPath("assets/cuts/placeholder-cut.svg"),
338:     description:
339:       "A flavorful rib cut selected for richness, structure, and a distinctive Ibérico eating profile.",
340:     service:
341:       "Best for smoking, roasting, glazing, grilling, and elevated rib service.",
342:     rows: [

---- lines 327-355 ----
327:     service:
328:       "Best for roasting, grilling, carving tableside, and premium menu features.",
329:     rows: [
330:       ["FP05", "4-Rib Rack", "6/2.1# AVG. ~ 13# CS"],
331:     ],
332:   },
333:   "Iberico St. Louis Ribs": {
334:     eyebrow: "Selected Cut",
335:     title: "Iberico St. Louis Ribs",
336:     category: "Ibérico Pork",
337:     image: assetPath("assets/cuts/placeholder-cut.svg"),
338:     description:
339:       "A flavorful rib cut selected for richness, structure, and a distinctive Ibérico eating profile.",
340:     service:
341:       "Best for smoking, roasting, glazing, grilling, and elevated rib service.",
342:     rows: [
343:       ["FP09", "St. Louis Rib", "6/1.8# AVG. ~ 11# CS"],
344:     ],
345:   },
346:   "Iberico Pork Belly": {
347:     eyebrow: "Selected Cut",
348:     title: "Iberico Pork Belly",
349:     category: "Ibérico Pork",
350:     image: assetPath("assets/cuts/placeholder-cut.svg"),
351:     description:
352:       "A richly marbled belly cut selected for depth, texture, and luxurious rendered flavor.",
353:     service:
354:       "Best for roasting, slow cooking, crisping, slicing, and composed pork plates.",
355:     rows: [

---- lines 340-368 ----
340:     service:
341:       "Best for smoking, roasting, glazing, grilling, and elevated rib service.",
342:     rows: [
343:       ["FP09", "St. Louis Rib", "6/1.8# AVG. ~ 11# CS"],
344:     ],
345:   },
346:   "Iberico Pork Belly": {
347:     eyebrow: "Selected Cut",
348:     title: "Iberico Pork Belly",
349:     category: "Ibérico Pork",
350:     image: assetPath("assets/cuts/placeholder-cut.svg"),
351:     description:
352:       "A richly marbled belly cut selected for depth, texture, and luxurious rendered flavor.",
353:     service:
354:       "Best for roasting, slow cooking, crisping, slicing, and composed pork plates.",
355:     rows: [
356:       ["FP06", "Belly", "12/1.25# AVG. ~ 15# CS"],
357:     ],
358:   },
359:   "Iberico Shoulder Picnic": {
360:     eyebrow: "Selected Cut",
361:     title: "Iberico Shoulder Picnic",
362:     category: "Ibérico Pork",
363:     image: assetPath("assets/cuts/placeholder-cut.svg"),
364:     description:
365:       "A hearty Ibérico shoulder cut selected for depth, slow-cooked tenderness, and bold savory character.",
366:     service:
367:       "Best for braising, roasting, smoking, pulling, and generous shared preparations.",
368:     rows: [

---- lines 353-381 ----
353:     service:
354:       "Best for roasting, slow cooking, crisping, slicing, and composed pork plates.",
355:     rows: [
356:       ["FP06", "Belly", "12/1.25# AVG. ~ 15# CS"],
357:     ],
358:   },
359:   "Iberico Shoulder Picnic": {
360:     eyebrow: "Selected Cut",
361:     title: "Iberico Shoulder Picnic",
362:     category: "Ibérico Pork",
363:     image: assetPath("assets/cuts/placeholder-cut.svg"),
364:     description:
365:       "A hearty Ibérico shoulder cut selected for depth, slow-cooked tenderness, and bold savory character.",
366:     service:
367:       "Best for braising, roasting, smoking, pulling, and generous shared preparations.",
368:     rows: [
369:       ["FP21", "Picnic Shoulder", "2/16# AVG. ~ 32# CS"],
370:     ],
371:   },
372: };
373: 
374: const escapeHtml = (value) =>
375:   String(value)
376:     .replaceAll("&", "&amp;")
377:     .replaceAll("<", "&lt;")
378:     .replaceAll(">", "&gt;")
379:     .replaceAll('"', "&quot;")
380:     .replaceAll("'", "&#039;");
381: 

---- lines 386-414 ----
386:         <tr>
387:           <td>${escapeHtml(code)}</td>
388:           <td>${escapeHtml(product)}</td>
389:           <td>${escapeHtml(specification)}</td>
390:         </tr>
391:       `,
392:     )
393:     .join("");
394: 
395: // CONNECTED_CATALOG_CUT_TO_PRODUCER_HELPERS_START
396: const selectedCutTitleToId = {
397:   Ribeye: "ribeye",
398:   Tenderloin: "tenderloin",
399:   Striploin: "striploin",
400:   Tomahawk: "tomahawk",
401:   Presa: "presa",
402:   Secreto: "secreto",
403:   "Rump Cap": "rump-cap",
404:   Picanha: "rump-cap",
405:   "Short Rib": "short-rib",
406:   "Chuck Roll": "chuck-roll",
407:   "Shortloin": "shortloin",
408:   "Flap Meat": "flap-meat",
409:   "Flank Steak": "flank-steak",
410:   "Tri Tip": "tri-tip",
411:   "Top Sirloin": "top-sirloin",
412:   "Oyster Blade": "oyster-blade",
413:   "Chuck Tail Flap": "chuck-tail-flap",
414:   "Iberico Abanico": "iberico-abanico",

---- lines 415-443 ----
415:   "Iberico Pluma": "iberico-pluma",
416:   "Iberico Coppa": "iberico-coppa",
417:   "Iberico Loin Roast": "iberico-loin-roast",
418:   "Iberico 4 Rib-Rack": "iberico-4-rib-rack",
419:   "Iberico St. Louis Ribs": "iberico-st-louis-ribs",
420:   "Iberico Pork Belly": "iberico-pork-belly",
421:   "Iberico Shoulder Picnic": "iberico-shoulder-picnic",
422: };
423: 
424: const getConnectedProducersForCut = (cutName) => {
425:   const cut = selectedCuts[cutName];
426:   const cutId = selectedCutTitleToId[cutName] || selectedCutTitleToId[cut?.title];
427: 
428:   if (!cutId) {
429:     return [];
430:   }
431: 
432:   return producers.filter((producer) => (producerCutLinks[producer.id] || []).includes(cutId));
433: };
434: 
435: const createProducerProgramLinks = (cutName) => {
436:   const relatedProducers = getConnectedProducersForCut(cutName);
437: 
438:   if (relatedProducers.length === 0) {
439:     return "";
440:   }
441: 
442:   const buttons = relatedProducers
443:     .map(

---- lines 416-444 ----
416:   "Iberico Coppa": "iberico-coppa",
417:   "Iberico Loin Roast": "iberico-loin-roast",
418:   "Iberico 4 Rib-Rack": "iberico-4-rib-rack",
419:   "Iberico St. Louis Ribs": "iberico-st-louis-ribs",
420:   "Iberico Pork Belly": "iberico-pork-belly",
421:   "Iberico Shoulder Picnic": "iberico-shoulder-picnic",
422: };
423: 
424: const getConnectedProducersForCut = (cutName) => {
425:   const cut = selectedCuts[cutName];
426:   const cutId = selectedCutTitleToId[cutName] || selectedCutTitleToId[cut?.title];
427: 
428:   if (!cutId) {
429:     return [];
430:   }
431: 
432:   return producers.filter((producer) => (producerCutLinks[producer.id] || []).includes(cutId));
433: };
434: 
435: const createProducerProgramLinks = (cutName) => {
436:   const relatedProducers = getConnectedProducersForCut(cutName);
437: 
438:   if (relatedProducers.length === 0) {
439:     return "";
440:   }
441: 
442:   const buttons = relatedProducers
443:     .map(
444:       (producer) => `

---- lines 460-488 ----
460:         <span>Producer Programs</span>
461:         <p>Producer programs for this cut.</p>
462:       </div>
463:       <div class="selected-cut-modal__producer-links-list">
464:         ${buttons}
465:       </div>
466:     </section>
467:   `;
468: };
469: // CONNECTED_CATALOG_CUT_TO_PRODUCER_HELPERS_END
470: export function initSelectedCutsModal() {
471:   const modalContent = `
472:     <div class="selected-cut-modal__panel">
473:       <button class="selected-cut-modal__close" type="button" aria-label="Close selected cut details" data-selected-cut-close>
474:         <span aria-hidden="true">×</span>
475:       </button>
476: 
477:       <div class="selected-cut-modal__body">
478:         <figure class="selected-cut-modal__media">
479:           <img data-selected-cut-image src="" alt="" loading="lazy" />
480:           <figcaption data-selected-cut-fallback>Selected Cut</figcaption>
481:         </figure>
482: 
483:         <section class="selected-cut-modal__content">
484:           <p class="selected-cut-modal__eyebrow" data-selected-cut-eyebrow>Selected Cut</p>
485:           <h2 id="selected-cut-modal-title" data-selected-cut-title>Selected Cut</h2>
486:           <p class="selected-cut-modal__category" data-selected-cut-category></p>
487:           <p class="selected-cut-modal__description" data-selected-cut-description></p>
488: 

---- lines 468-496 ----
468: };
469: // CONNECTED_CATALOG_CUT_TO_PRODUCER_HELPERS_END
470: export function initSelectedCutsModal() {
471:   const modalContent = `
472:     <div class="selected-cut-modal__panel">
473:       <button class="selected-cut-modal__close" type="button" aria-label="Close selected cut details" data-selected-cut-close>
474:         <span aria-hidden="true">×</span>
475:       </button>
476: 
477:       <div class="selected-cut-modal__body">
478:         <figure class="selected-cut-modal__media">
479:           <img data-selected-cut-image src="" alt="" loading="lazy" />
480:           <figcaption data-selected-cut-fallback>Selected Cut</figcaption>
481:         </figure>
482: 
483:         <section class="selected-cut-modal__content">
484:           <p class="selected-cut-modal__eyebrow" data-selected-cut-eyebrow>Selected Cut</p>
485:           <h2 id="selected-cut-modal-title" data-selected-cut-title>Selected Cut</h2>
486:           <p class="selected-cut-modal__category" data-selected-cut-category></p>
487:           <p class="selected-cut-modal__description" data-selected-cut-description></p>
488: 
489:           <div class="selected-cut-modal__note">
490:             <span>Service Note</span>
491:             <p data-selected-cut-service></p>
492:           </div>
493: 
494:           <div class="selected-cut-modal__producer-links-slot" data-selected-cut-producers></div>
495: 
496:           <div class="selected-cut-modal__table-wrap">

---- lines 469-497 ----
469: // CONNECTED_CATALOG_CUT_TO_PRODUCER_HELPERS_END
470: export function initSelectedCutsModal() {
471:   const modalContent = `
472:     <div class="selected-cut-modal__panel">
473:       <button class="selected-cut-modal__close" type="button" aria-label="Close selected cut details" data-selected-cut-close>
474:         <span aria-hidden="true">×</span>
475:       </button>
476: 
477:       <div class="selected-cut-modal__body">
478:         <figure class="selected-cut-modal__media">
479:           <img data-selected-cut-image src="" alt="" loading="lazy" />
480:           <figcaption data-selected-cut-fallback>Selected Cut</figcaption>
481:         </figure>
482: 
483:         <section class="selected-cut-modal__content">
484:           <p class="selected-cut-modal__eyebrow" data-selected-cut-eyebrow>Selected Cut</p>
485:           <h2 id="selected-cut-modal-title" data-selected-cut-title>Selected Cut</h2>
486:           <p class="selected-cut-modal__category" data-selected-cut-category></p>
487:           <p class="selected-cut-modal__description" data-selected-cut-description></p>
488: 
489:           <div class="selected-cut-modal__note">
490:             <span>Service Note</span>
491:             <p data-selected-cut-service></p>
492:           </div>
493: 
494:           <div class="selected-cut-modal__producer-links-slot" data-selected-cut-producers></div>
495: 
496:           <div class="selected-cut-modal__table-wrap">
497:             <table class="selected-cut-modal__table">

---- lines 525-553 ----
525: 
526:   const panel = modal.querySelector(".selected-cut-modal__panel");
527:   const closeButton = modal.querySelector("[data-selected-cut-close]");
528:   const eyebrowNode = modal.querySelector("[data-selected-cut-eyebrow]");
529:   const titleNode = modal.querySelector("[data-selected-cut-title]");
530:   const categoryNode = modal.querySelector("[data-selected-cut-category]");
531:   const descriptionNode = modal.querySelector("[data-selected-cut-description]");
532:   const serviceNode = modal.querySelector("[data-selected-cut-service]");
533:   const producersNode = modal.querySelector("[data-selected-cut-producers]");
534:   const rowsNode = modal.querySelector("[data-selected-cut-rows]");
535:   const imageNode = modal.querySelector("[data-selected-cut-image]");
536:   const fallbackNode = modal.querySelector("[data-selected-cut-fallback]");
537: 
538:   const openSelectedCut = (cutName, trigger) => {
539:     const cut = selectedCuts[cutName];
540: 
541:     if (!cut) {
542:       return;
543:     }
544: 
545:     lastTrigger = trigger || null;
546: 
547:     eyebrowNode.textContent = cut.eyebrow;
548:     titleNode.textContent = cut.title;
549:     categoryNode.textContent = cut.category;
550:     descriptionNode.textContent = cut.description;
551:     serviceNode.textContent = cut.service;
552: 
553:     if (producersNode) {

---- lines 528-556 ----
528:   const eyebrowNode = modal.querySelector("[data-selected-cut-eyebrow]");
529:   const titleNode = modal.querySelector("[data-selected-cut-title]");
530:   const categoryNode = modal.querySelector("[data-selected-cut-category]");
531:   const descriptionNode = modal.querySelector("[data-selected-cut-description]");
532:   const serviceNode = modal.querySelector("[data-selected-cut-service]");
533:   const producersNode = modal.querySelector("[data-selected-cut-producers]");
534:   const rowsNode = modal.querySelector("[data-selected-cut-rows]");
535:   const imageNode = modal.querySelector("[data-selected-cut-image]");
536:   const fallbackNode = modal.querySelector("[data-selected-cut-fallback]");
537: 
538:   const openSelectedCut = (cutName, trigger) => {
539:     const cut = selectedCuts[cutName];
540: 
541:     if (!cut) {
542:       return;
543:     }
544: 
545:     lastTrigger = trigger || null;
546: 
547:     eyebrowNode.textContent = cut.eyebrow;
548:     titleNode.textContent = cut.title;
549:     categoryNode.textContent = cut.category;
550:     descriptionNode.textContent = cut.description;
551:     serviceNode.textContent = cut.service;
552: 
553:     if (producersNode) {
554:       producersNode.innerHTML = createProducerProgramLinks(cutName);
555:     }
556:     rowsNode.innerHTML = createRows(cut.rows);

---- lines 529-557 ----
529:   const titleNode = modal.querySelector("[data-selected-cut-title]");
530:   const categoryNode = modal.querySelector("[data-selected-cut-category]");
531:   const descriptionNode = modal.querySelector("[data-selected-cut-description]");
532:   const serviceNode = modal.querySelector("[data-selected-cut-service]");
533:   const producersNode = modal.querySelector("[data-selected-cut-producers]");
534:   const rowsNode = modal.querySelector("[data-selected-cut-rows]");
535:   const imageNode = modal.querySelector("[data-selected-cut-image]");
536:   const fallbackNode = modal.querySelector("[data-selected-cut-fallback]");
537: 
538:   const openSelectedCut = (cutName, trigger) => {
539:     const cut = selectedCuts[cutName];
540: 
541:     if (!cut) {
542:       return;
543:     }
544: 
545:     lastTrigger = trigger || null;
546: 
547:     eyebrowNode.textContent = cut.eyebrow;
548:     titleNode.textContent = cut.title;
549:     categoryNode.textContent = cut.category;
550:     descriptionNode.textContent = cut.description;
551:     serviceNode.textContent = cut.service;
552: 
553:     if (producersNode) {
554:       producersNode.innerHTML = createProducerProgramLinks(cutName);
555:     }
556:     rowsNode.innerHTML = createRows(cut.rows);
557:     fallbackNode.textContent = cut.title;

---- lines 549-577 ----
549:     categoryNode.textContent = cut.category;
550:     descriptionNode.textContent = cut.description;
551:     serviceNode.textContent = cut.service;
552: 
553:     if (producersNode) {
554:       producersNode.innerHTML = createProducerProgramLinks(cutName);
555:     }
556:     rowsNode.innerHTML = createRows(cut.rows);
557:     fallbackNode.textContent = cut.title;
558: 
559:     imageNode.hidden = false;
560:     fallbackNode.hidden = true;
561:     imageNode.alt = "";
562:     imageNode.src = cut.image;
563: 
564:     imageNode.onerror = () => {
565:       imageNode.hidden = true;
566:       fallbackNode.hidden = false;
567:     };
568: 
569:     document.body.classList.add("selected-cut-modal-open");
570: 
571:     if (typeof modal.showModal === "function" && !modal.open) {
572:       modal.showModal();
573:       return;
574:     }
575: 
576:     modal.setAttribute("open", "");
577:   };

---- lines 551-579 ----
551:     serviceNode.textContent = cut.service;
552: 
553:     if (producersNode) {
554:       producersNode.innerHTML = createProducerProgramLinks(cutName);
555:     }
556:     rowsNode.innerHTML = createRows(cut.rows);
557:     fallbackNode.textContent = cut.title;
558: 
559:     imageNode.hidden = false;
560:     fallbackNode.hidden = true;
561:     imageNode.alt = "";
562:     imageNode.src = cut.image;
563: 
564:     imageNode.onerror = () => {
565:       imageNode.hidden = true;
566:       fallbackNode.hidden = false;
567:     };
568: 
569:     document.body.classList.add("selected-cut-modal-open");
570: 
571:     if (typeof modal.showModal === "function" && !modal.open) {
572:       modal.showModal();
573:       return;
574:     }
575: 
576:     modal.setAttribute("open", "");
577:   };
578: 
579:   window.PARAGON_SELECTED_CUTS = {

---- lines 552-580 ----
552: 
553:     if (producersNode) {
554:       producersNode.innerHTML = createProducerProgramLinks(cutName);
555:     }
556:     rowsNode.innerHTML = createRows(cut.rows);
557:     fallbackNode.textContent = cut.title;
558: 
559:     imageNode.hidden = false;
560:     fallbackNode.hidden = true;
561:     imageNode.alt = "";
562:     imageNode.src = cut.image;
563: 
564:     imageNode.onerror = () => {
565:       imageNode.hidden = true;
566:       fallbackNode.hidden = false;
567:     };
568: 
569:     document.body.classList.add("selected-cut-modal-open");
570: 
571:     if (typeof modal.showModal === "function" && !modal.open) {
572:       modal.showModal();
573:       return;
574:     }
575: 
576:     modal.setAttribute("open", "");
577:   };
578: 
579:   window.PARAGON_SELECTED_CUTS = {
580:     open: (cutName) => openSelectedCut(cutName, null),

---- lines 554-582 ----
554:       producersNode.innerHTML = createProducerProgramLinks(cutName);
555:     }
556:     rowsNode.innerHTML = createRows(cut.rows);
557:     fallbackNode.textContent = cut.title;
558: 
559:     imageNode.hidden = false;
560:     fallbackNode.hidden = true;
561:     imageNode.alt = "";
562:     imageNode.src = cut.image;
563: 
564:     imageNode.onerror = () => {
565:       imageNode.hidden = true;
566:       fallbackNode.hidden = false;
567:     };
568: 
569:     document.body.classList.add("selected-cut-modal-open");
570: 
571:     if (typeof modal.showModal === "function" && !modal.open) {
572:       modal.showModal();
573:       return;
574:     }
575: 
576:     modal.setAttribute("open", "");
577:   };
578: 
579:   window.PARAGON_SELECTED_CUTS = {
580:     open: (cutName) => openSelectedCut(cutName, null),
581:     has: (cutName) => Boolean(selectedCuts[cutName]),
582:   };

---- lines 555-583 ----
555:     }
556:     rowsNode.innerHTML = createRows(cut.rows);
557:     fallbackNode.textContent = cut.title;
558: 
559:     imageNode.hidden = false;
560:     fallbackNode.hidden = true;
561:     imageNode.alt = "";
562:     imageNode.src = cut.image;
563: 
564:     imageNode.onerror = () => {
565:       imageNode.hidden = true;
566:       fallbackNode.hidden = false;
567:     };
568: 
569:     document.body.classList.add("selected-cut-modal-open");
570: 
571:     if (typeof modal.showModal === "function" && !modal.open) {
572:       modal.showModal();
573:       return;
574:     }
575: 
576:     modal.setAttribute("open", "");
577:   };
578: 
579:   window.PARAGON_SELECTED_CUTS = {
580:     open: (cutName) => openSelectedCut(cutName, null),
581:     has: (cutName) => Boolean(selectedCuts[cutName]),
582:   };
583: 

---- lines 570-598 ----
570: 
571:     if (typeof modal.showModal === "function" && !modal.open) {
572:       modal.showModal();
573:       return;
574:     }
575: 
576:     modal.setAttribute("open", "");
577:   };
578: 
579:   window.PARAGON_SELECTED_CUTS = {
580:     open: (cutName) => openSelectedCut(cutName, null),
581:     has: (cutName) => Boolean(selectedCuts[cutName]),
582:   };
583: 
584:   window.addEventListener("paragon:open-selected-cut", (event) => {
585:     const cutName = event.detail?.cutName || event.detail?.title;
586: 
587:     if (cutName) {
588:       openSelectedCut(cutName, null);
589:     }
590:   });
591:   const closeSelectedCut = () => {
592:     document.body.classList.remove("selected-cut-modal-open");
593: 
594:     if (typeof modal.close === "function" && modal.open) {
595:       modal.close();
596:     } else {
597:       modal.removeAttribute("open");
598:     }

---- lines 571-599 ----
571:     if (typeof modal.showModal === "function" && !modal.open) {
572:       modal.showModal();
573:       return;
574:     }
575: 
576:     modal.setAttribute("open", "");
577:   };
578: 
579:   window.PARAGON_SELECTED_CUTS = {
580:     open: (cutName) => openSelectedCut(cutName, null),
581:     has: (cutName) => Boolean(selectedCuts[cutName]),
582:   };
583: 
584:   window.addEventListener("paragon:open-selected-cut", (event) => {
585:     const cutName = event.detail?.cutName || event.detail?.title;
586: 
587:     if (cutName) {
588:       openSelectedCut(cutName, null);
589:     }
590:   });
591:   const closeSelectedCut = () => {
592:     document.body.classList.remove("selected-cut-modal-open");
593: 
594:     if (typeof modal.close === "function" && modal.open) {
595:       modal.close();
596:     } else {
597:       modal.removeAttribute("open");
598:     }
599: 

---- lines 578-606 ----
578: 
579:   window.PARAGON_SELECTED_CUTS = {
580:     open: (cutName) => openSelectedCut(cutName, null),
581:     has: (cutName) => Boolean(selectedCuts[cutName]),
582:   };
583: 
584:   window.addEventListener("paragon:open-selected-cut", (event) => {
585:     const cutName = event.detail?.cutName || event.detail?.title;
586: 
587:     if (cutName) {
588:       openSelectedCut(cutName, null);
589:     }
590:   });
591:   const closeSelectedCut = () => {
592:     document.body.classList.remove("selected-cut-modal-open");
593: 
594:     if (typeof modal.close === "function" && modal.open) {
595:       modal.close();
596:     } else {
597:       modal.removeAttribute("open");
598:     }
599: 
600:     rowsNode.innerHTML = "";
601:     imageNode.removeAttribute("src");
602: 
603:     if (lastTrigger && typeof lastTrigger.focus === "function") {
604:       lastTrigger.focus({ preventScroll: true });
605:     }
606:   };

---- lines 581-609 ----
581:     has: (cutName) => Boolean(selectedCuts[cutName]),
582:   };
583: 
584:   window.addEventListener("paragon:open-selected-cut", (event) => {
585:     const cutName = event.detail?.cutName || event.detail?.title;
586: 
587:     if (cutName) {
588:       openSelectedCut(cutName, null);
589:     }
590:   });
591:   const closeSelectedCut = () => {
592:     document.body.classList.remove("selected-cut-modal-open");
593: 
594:     if (typeof modal.close === "function" && modal.open) {
595:       modal.close();
596:     } else {
597:       modal.removeAttribute("open");
598:     }
599: 
600:     rowsNode.innerHTML = "";
601:     imageNode.removeAttribute("src");
602: 
603:     if (lastTrigger && typeof lastTrigger.focus === "function") {
604:       lastTrigger.focus({ preventScroll: true });
605:     }
606:   };
607: 
608:   document.querySelectorAll(".cut-card").forEach((card) => {
609:     const title = card.dataset.selectedCutTrigger || card.querySelector("h3")?.textContent?.trim();

---- lines 591-619 ----
591:   const closeSelectedCut = () => {
592:     document.body.classList.remove("selected-cut-modal-open");
593: 
594:     if (typeof modal.close === "function" && modal.open) {
595:       modal.close();
596:     } else {
597:       modal.removeAttribute("open");
598:     }
599: 
600:     rowsNode.innerHTML = "";
601:     imageNode.removeAttribute("src");
602: 
603:     if (lastTrigger && typeof lastTrigger.focus === "function") {
604:       lastTrigger.focus({ preventScroll: true });
605:     }
606:   };
607: 
608:   document.querySelectorAll(".cut-card").forEach((card) => {
609:     const title = card.dataset.selectedCutTrigger || card.querySelector("h3")?.textContent?.trim();
610: 
611:     if (!title || !selectedCuts[title]) {
612:       return;
613:     }
614: 
615:     card.dataset.selectedCutTrigger = title;
616:     card.setAttribute("role", "button");
617:     card.setAttribute("tabindex", "0");
618:     const cutLabel = selectedCuts[title].title || title;
619:     card.setAttribute("aria-label", `Open ${cutLabel} details`);

---- lines 599-627 ----
599: 
600:     rowsNode.innerHTML = "";
601:     imageNode.removeAttribute("src");
602: 
603:     if (lastTrigger && typeof lastTrigger.focus === "function") {
604:       lastTrigger.focus({ preventScroll: true });
605:     }
606:   };
607: 
608:   document.querySelectorAll(".cut-card").forEach((card) => {
609:     const title = card.dataset.selectedCutTrigger || card.querySelector("h3")?.textContent?.trim();
610: 
611:     if (!title || !selectedCuts[title]) {
612:       return;
613:     }
614: 
615:     card.dataset.selectedCutTrigger = title;
616:     card.setAttribute("role", "button");
617:     card.setAttribute("tabindex", "0");
618:     const cutLabel = selectedCuts[title].title || title;
619:     card.setAttribute("aria-label", `Open ${cutLabel} details`);
620: 
621:     card.addEventListener("click", () => {
622:       openSelectedCut(title, card);
623:     });
624: 
625:     card.addEventListener("keydown", (event) => {
626:       if (event.key === "Enter" || event.key === " ") {
627:         event.preventDefault();

---- lines 601-629 ----
601:     imageNode.removeAttribute("src");
602: 
603:     if (lastTrigger && typeof lastTrigger.focus === "function") {
604:       lastTrigger.focus({ preventScroll: true });
605:     }
606:   };
607: 
608:   document.querySelectorAll(".cut-card").forEach((card) => {
609:     const title = card.dataset.selectedCutTrigger || card.querySelector("h3")?.textContent?.trim();
610: 
611:     if (!title || !selectedCuts[title]) {
612:       return;
613:     }
614: 
615:     card.dataset.selectedCutTrigger = title;
616:     card.setAttribute("role", "button");
617:     card.setAttribute("tabindex", "0");
618:     const cutLabel = selectedCuts[title].title || title;
619:     card.setAttribute("aria-label", `Open ${cutLabel} details`);
620: 
621:     card.addEventListener("click", () => {
622:       openSelectedCut(title, card);
623:     });
624: 
625:     card.addEventListener("keydown", (event) => {
626:       if (event.key === "Enter" || event.key === " ") {
627:         event.preventDefault();
628:         openSelectedCut(title, card);
629:       }

---- lines 605-633 ----
605:     }
606:   };
607: 
608:   document.querySelectorAll(".cut-card").forEach((card) => {
609:     const title = card.dataset.selectedCutTrigger || card.querySelector("h3")?.textContent?.trim();
610: 
611:     if (!title || !selectedCuts[title]) {
612:       return;
613:     }
614: 
615:     card.dataset.selectedCutTrigger = title;
616:     card.setAttribute("role", "button");
617:     card.setAttribute("tabindex", "0");
618:     const cutLabel = selectedCuts[title].title || title;
619:     card.setAttribute("aria-label", `Open ${cutLabel} details`);
620: 
621:     card.addEventListener("click", () => {
622:       openSelectedCut(title, card);
623:     });
624: 
625:     card.addEventListener("keydown", (event) => {
626:       if (event.key === "Enter" || event.key === " ") {
627:         event.preventDefault();
628:         openSelectedCut(title, card);
629:       }
630:     });
631:   });
632: 
633:   // CONNECTED_CATALOG_CUT_TO_PRODUCER_EVENTS_START

---- lines 608-636 ----
608:   document.querySelectorAll(".cut-card").forEach((card) => {
609:     const title = card.dataset.selectedCutTrigger || card.querySelector("h3")?.textContent?.trim();
610: 
611:     if (!title || !selectedCuts[title]) {
612:       return;
613:     }
614: 
615:     card.dataset.selectedCutTrigger = title;
616:     card.setAttribute("role", "button");
617:     card.setAttribute("tabindex", "0");
618:     const cutLabel = selectedCuts[title].title || title;
619:     card.setAttribute("aria-label", `Open ${cutLabel} details`);
620: 
621:     card.addEventListener("click", () => {
622:       openSelectedCut(title, card);
623:     });
624: 
625:     card.addEventListener("keydown", (event) => {
626:       if (event.key === "Enter" || event.key === " ") {
627:         event.preventDefault();
628:         openSelectedCut(title, card);
629:       }
630:     });
631:   });
632: 
633:   // CONNECTED_CATALOG_CUT_TO_PRODUCER_EVENTS_START
634:   modal.addEventListener(
635:     "click",
636:     (event) => {

---- lines 612-640 ----
612:       return;
613:     }
614: 
615:     card.dataset.selectedCutTrigger = title;
616:     card.setAttribute("role", "button");
617:     card.setAttribute("tabindex", "0");
618:     const cutLabel = selectedCuts[title].title || title;
619:     card.setAttribute("aria-label", `Open ${cutLabel} details`);
620: 
621:     card.addEventListener("click", () => {
622:       openSelectedCut(title, card);
623:     });
624: 
625:     card.addEventListener("keydown", (event) => {
626:       if (event.key === "Enter" || event.key === " ") {
627:         event.preventDefault();
628:         openSelectedCut(title, card);
629:       }
630:     });
631:   });
632: 
633:   // CONNECTED_CATALOG_CUT_TO_PRODUCER_EVENTS_START
634:   modal.addEventListener(
635:     "click",
636:     (event) => {
637:       const producerButton = event.target.closest("[data-connected-producer-trigger]");
638: 
639:       if (!producerButton) {
640:         return;

---- lines 618-646 ----
618:     const cutLabel = selectedCuts[title].title || title;
619:     card.setAttribute("aria-label", `Open ${cutLabel} details`);
620: 
621:     card.addEventListener("click", () => {
622:       openSelectedCut(title, card);
623:     });
624: 
625:     card.addEventListener("keydown", (event) => {
626:       if (event.key === "Enter" || event.key === " ") {
627:         event.preventDefault();
628:         openSelectedCut(title, card);
629:       }
630:     });
631:   });
632: 
633:   // CONNECTED_CATALOG_CUT_TO_PRODUCER_EVENTS_START
634:   modal.addEventListener(
635:     "click",
636:     (event) => {
637:       const producerButton = event.target.closest("[data-connected-producer-trigger]");
638: 
639:       if (!producerButton) {
640:         return;
641:       }
642: 
643:       event.preventDefault();
644:       event.stopPropagation();
645: 
646:       const productListTitle = producerButton.dataset.connectedProducerTrigger;

---- lines 642-670 ----
642: 
643:       event.preventDefault();
644:       event.stopPropagation();
645: 
646:       const productListTitle = producerButton.dataset.connectedProducerTrigger;
647: 
648:       if (!productListTitle) {
649:         return;
650:       }
651: 
652:       closeSelectedCut();
653: 
654:       window.setTimeout(() => {
655:         window.dispatchEvent(
656:           new CustomEvent("paragon:open-producer", {
657:             detail: { productListTitle },
658:           }),
659:         );
660:       }, 140);
661:     },
662:     true,
663:   );
664:   // CONNECTED_CATALOG_CUT_TO_PRODUCER_EVENTS_END
665:   closeButton?.addEventListener("click", closeSelectedCut);
666: 
667:   modal.addEventListener("click", (event) => {
668:     if (panel && !panel.contains(event.target)) {
669:       closeSelectedCut();
670:     }

---- lines 655-683 ----
655:         window.dispatchEvent(
656:           new CustomEvent("paragon:open-producer", {
657:             detail: { productListTitle },
658:           }),
659:         );
660:       }, 140);
661:     },
662:     true,
663:   );
664:   // CONNECTED_CATALOG_CUT_TO_PRODUCER_EVENTS_END
665:   closeButton?.addEventListener("click", closeSelectedCut);
666: 
667:   modal.addEventListener("click", (event) => {
668:     if (panel && !panel.contains(event.target)) {
669:       closeSelectedCut();
670:     }
671:   });
672: 
673:   modal.addEventListener("close", () => {
674:     document.body.classList.remove("selected-cut-modal-open");
675:     rowsNode.innerHTML = "";
676:     imageNode.removeAttribute("src");
677:   });
678: 
679:   document.addEventListener("keydown", (event) => {
680:     if (event.key === "Escape" && modal.open) {
681:       closeSelectedCut();
682:     }
683:   });

---- lines 659-684 ----
659:         );
660:       }, 140);
661:     },
662:     true,
663:   );
664:   // CONNECTED_CATALOG_CUT_TO_PRODUCER_EVENTS_END
665:   closeButton?.addEventListener("click", closeSelectedCut);
666: 
667:   modal.addEventListener("click", (event) => {
668:     if (panel && !panel.contains(event.target)) {
669:       closeSelectedCut();
670:     }
671:   });
672: 
673:   modal.addEventListener("close", () => {
674:     document.body.classList.remove("selected-cut-modal-open");
675:     rowsNode.innerHTML = "";
676:     imageNode.removeAttribute("src");
677:   });
678: 
679:   document.addEventListener("keydown", (event) => {
680:     if (event.key === "Escape" && modal.open) {
681:       closeSelectedCut();
682:     }
683:   });
684: }

---- lines 666-684 ----
666: 
667:   modal.addEventListener("click", (event) => {
668:     if (panel && !panel.contains(event.target)) {
669:       closeSelectedCut();
670:     }
671:   });
672: 
673:   modal.addEventListener("close", () => {
674:     document.body.classList.remove("selected-cut-modal-open");
675:     rowsNode.innerHTML = "";
676:     imageNode.removeAttribute("src");
677:   });
678: 
679:   document.addEventListener("keydown", (event) => {
680:     if (event.key === "Escape" && modal.open) {
681:       closeSelectedCut();
682:     }
683:   });
684: }

---- lines 671-684 ----
671:   });
672: 
673:   modal.addEventListener("close", () => {
674:     document.body.classList.remove("selected-cut-modal-open");
675:     rowsNode.innerHTML = "";
676:     imageNode.removeAttribute("src");
677:   });
678: 
679:   document.addEventListener("keydown", (event) => {
680:     if (event.key === "Escape" && modal.open) {
681:       closeSelectedCut();
682:     }
683:   });
684: }

```

## selectedCutsModal.js Render / Open Context

```text
---- lines 1-21 ----
1: import { assetPath } from "./assetPath.js";
2: import { producerCutLinks, producers } from "./catalogData.js";
3: const selectedCuts = {
4:   Ribeye: {
5:     eyebrow: "Selected Cut",
6:     title: "Ribeye",
7:     category: "Beef / Wagyu",
8:     image: assetPath("assets/cuts/ribeye.jpg"),
9:     description:
10:       "A richly marbled center-plate cut selected for depth, tenderness, and a refined eating profile.",
11:     service:
12:       "Best for high-heat searing, grilling, and premium steak service.",
13:     rows: [
14:       ["14107", "Ribeye", "3/12.5# AVG. ~ 38# CS"],
15:       ["24107", "Ribeye", "3/12.5# AVG. ~ 38# CS"],
16:       ["34107", "Ribeye", "3/12.5# AVG. ~ 38# CS"],
17:       ["37907", "Ribeye", "4/9# AVG. ~ 38# CS"],
18:       ["22402W", "Ribeye Lip Off", "2/14# AVG. ~ 28# CS"],
19:       ["22409T", "Ribeye Lip Off", "2/14# AVG. ~ 28# CS"],
20:       ["2240XA", "Rib Eye Roll Lip Off 7LB+", "3/10# AVG. ~ 30# CS"],
21:       ["2240XB", "Rib Eye Roll Lip Off 7LB+", "3/10# AVG. ~ 30# CS"],

---- lines 1-26 ----
1: import { assetPath } from "./assetPath.js";
2: import { producerCutLinks, producers } from "./catalogData.js";
3: const selectedCuts = {
4:   Ribeye: {
5:     eyebrow: "Selected Cut",
6:     title: "Ribeye",
7:     category: "Beef / Wagyu",
8:     image: assetPath("assets/cuts/ribeye.jpg"),
9:     description:
10:       "A richly marbled center-plate cut selected for depth, tenderness, and a refined eating profile.",
11:     service:
12:       "Best for high-heat searing, grilling, and premium steak service.",
13:     rows: [
14:       ["14107", "Ribeye", "3/12.5# AVG. ~ 38# CS"],
15:       ["24107", "Ribeye", "3/12.5# AVG. ~ 38# CS"],
16:       ["34107", "Ribeye", "3/12.5# AVG. ~ 38# CS"],
17:       ["37907", "Ribeye", "4/9# AVG. ~ 38# CS"],
18:       ["22402W", "Ribeye Lip Off", "2/14# AVG. ~ 28# CS"],
19:       ["22409T", "Ribeye Lip Off", "2/14# AVG. ~ 28# CS"],
20:       ["2240XA", "Rib Eye Roll Lip Off 7LB+", "3/10# AVG. ~ 30# CS"],
21:       ["2240XB", "Rib Eye Roll Lip Off 7LB+", "3/10# AVG. ~ 30# CS"],
22:     ],
23:   },
24:   Tenderloin: {
25:     eyebrow: "Selected Cut",
26:     title: "Tenderloin",

---- lines 18-46 ----
18:       ["22402W", "Ribeye Lip Off", "2/14# AVG. ~ 28# CS"],
19:       ["22409T", "Ribeye Lip Off", "2/14# AVG. ~ 28# CS"],
20:       ["2240XA", "Rib Eye Roll Lip Off 7LB+", "3/10# AVG. ~ 30# CS"],
21:       ["2240XB", "Rib Eye Roll Lip Off 7LB+", "3/10# AVG. ~ 30# CS"],
22:     ],
23:   },
24:   Tenderloin: {
25:     eyebrow: "Selected Cut",
26:     title: "Tenderloin",
27:     category: "Beef / Wagyu / Pork",
28:     image: assetPath("assets/cuts/tenderloin.jpg"),
29:     description:
30:       "A refined, tender cut selected for clean presentation, delicate texture, and elegant service.",
31:     service:
32:       "Best for fine-dining portions, pan searing, roasting, and composed plates.",
33:     rows: [
34:       ["14135", "Tenderloin", "4/5.5# AVG. ~ 22# CS"],
35:       ["24135", "Tenderloin", "4/5.5# AVG. ~ 22# CS"],
36:       ["34135", "Tenderloin", "4/5.5# AVG. ~ 22# CS"],
37:       ["37905", "Tenderloin", "4/7# AVG. ~ 30# CS"],
38:       ["FP18", "Tenderloin", "24/0.8# AVG. ~ 19.2# CS"],
39:       ["21602W", "Tenderloin SS Off", "6/5# AVG. ~ 30# CS"],
40:       ["21609T", "Tenderloin SS Off", "6/5# AVG. ~ 30# CS"],
41:       ["2160XA", "Tenderloin SS Off 4LB+", "6/4# AVG. ~ 24# CS"],
42:       ["2160XB", "Tenderloin SS Off 4LB+", "6/4# AVG. ~ 24# CS"],
43:     ],
44:   },
45:   Striploin: {
46:     eyebrow: "Selected Cut",

---- lines 39-67 ----
39:       ["21602W", "Tenderloin SS Off", "6/5# AVG. ~ 30# CS"],
40:       ["21609T", "Tenderloin SS Off", "6/5# AVG. ~ 30# CS"],
41:       ["2160XA", "Tenderloin SS Off 4LB+", "6/4# AVG. ~ 24# CS"],
42:       ["2160XB", "Tenderloin SS Off 4LB+", "6/4# AVG. ~ 24# CS"],
43:     ],
44:   },
45:   Striploin: {
46:     eyebrow: "Selected Cut",
47:     title: "Striploin",
48:     category: "Beef / Wagyu",
49:     image: assetPath("assets/cuts/striploin.jpg"),
50:     description:
51:       "A classic premium steak cut selected for balance, marbling, and a confident center-plate profile.",
52:     service:
53:       "Best for steaks, portioning, grilling, and refined steakhouse service.",
54:     rows: [
55:       ["14104", "Striploin", "3/13# AVG. ~ 40# CS"],
56:       ["24104", "Striploin", "3/13# AVG. ~ 40# CS"],
57:       ["34104", "Striploin", "3/13# AVG. ~ 40# CS"],
58:       ["37904", "Striploin", "2/19# AVG. ~ 37# CS"],
59:       ["37974", "Bone-In Striploin", "1/40# AVG. ~ 40# CS"],
60:       ["21402W", "Striploin", "2/15# AVG. ~ 30# CS"],
61:       ["21409T", "Striploin", "2/15# AVG. ~ 30# CS"],
62:       ["2140XA", "Striploin 11LB+", "3/12# AVG. ~ 36# CS"],
63:       ["1562XA", "B/In Striploin Vac", "3/12# AVG. ~ 36# CS"],
64:       ["2140XB", "Striploin 11LB+", "3/12# AVG. ~ 36# CS"],
65:       ["1562XB", "Striploin B/I", "2/16# AVG. ~ 32# CS"],
66:     ],
67:   },

---- lines 62-90 ----
62:       ["2140XA", "Striploin 11LB+", "3/12# AVG. ~ 36# CS"],
63:       ["1562XA", "B/In Striploin Vac", "3/12# AVG. ~ 36# CS"],
64:       ["2140XB", "Striploin 11LB+", "3/12# AVG. ~ 36# CS"],
65:       ["1562XB", "Striploin B/I", "2/16# AVG. ~ 32# CS"],
66:     ],
67:   },
68:   Tomahawk: {
69:     eyebrow: "Selected Cut",
70:     title: "Tomahawk",
71:     category: "Beef / Wagyu",
72:     image: assetPath("assets/cuts/tomahawk.jpg"),
73:     description:
74:       "A dramatic bone-in cut selected for visual impact, rich flavor, and celebratory presentation.",
75:     service:
76:       "Best for sharing portions, grilling, roasting, and high-impact menu features.",
77:     rows: [
78:       ["14101", "Tomahawk", "2/11# AVG. ~ 22# CS"],
79:       ["24101", "Tomahawk", "2/11# AVG. ~ 22# CS"],
80:       ["34101", "Tomahawk", "2/11# AVG. ~ 22# CS"],
81:       ["27972", "Tomahawk", "1/22# AVG. ~ 22# CS"],
82:       ["37972", "Tomahawk", "1/22# AVG. ~ 22# CS"],
83:       ["1602TW", "Tomahawk", "2/12# AVG. ~ 24# CS"],
84:       ["1602RW", "Tomahawk", "2/12# AVG. ~ 24# CS"],
85:     ],
86:   },
87:   Presa: {
88:     eyebrow: "Selected Cut",
89:     title: "Presa",
90:     category: "Ibérico Pork",

---- lines 81-109 ----
81:       ["27972", "Tomahawk", "1/22# AVG. ~ 22# CS"],
82:       ["37972", "Tomahawk", "1/22# AVG. ~ 22# CS"],
83:       ["1602TW", "Tomahawk", "2/12# AVG. ~ 24# CS"],
84:       ["1602RW", "Tomahawk", "2/12# AVG. ~ 24# CS"],
85:     ],
86:   },
87:   Presa: {
88:     eyebrow: "Selected Cut",
89:     title: "Presa",
90:     category: "Ibérico Pork",
91:     image: assetPath("assets/cuts/presa.jpg"),
92:     description:
93:       "A highly regarded Ibérico cut selected for deep flavor, tenderness, and generous marbling.",
94:     service:
95:       "Best for grilling, searing, slicing, and Spanish-inspired center-plate service.",
96:     rows: [["FP02", "Presa", "12/1.54# AVG. ~ 18.5# CS"]],
97:   },
98:   Secreto: {
99:     eyebrow: "Selected Cut",
100:     title: "Secreto",
101:     category: "Ibérico Pork",
102:     image: assetPath("assets/cuts/secreto.jpg"),
103:     description:
104:       "A richly marbled Ibérico cut selected for expressive flavor, quick cooking, and delicate texture.",
105:     service:
106:       "Best for hot searing, charcoal grilling, slicing, and small-plate service.",
107:     rows: [
108:       ["FP01", "Secreto", "16/1.1# AVG. ~ 17.5# CS"],
109:       ["FP15", "Jowl Secreto", "16/0.5# AVG. ~ 8# CS"],

---- lines 92-120 ----
92:     description:
93:       "A highly regarded Ibérico cut selected for deep flavor, tenderness, and generous marbling.",
94:     service:
95:       "Best for grilling, searing, slicing, and Spanish-inspired center-plate service.",
96:     rows: [["FP02", "Presa", "12/1.54# AVG. ~ 18.5# CS"]],
97:   },
98:   Secreto: {
99:     eyebrow: "Selected Cut",
100:     title: "Secreto",
101:     category: "Ibérico Pork",
102:     image: assetPath("assets/cuts/secreto.jpg"),
103:     description:
104:       "A richly marbled Ibérico cut selected for expressive flavor, quick cooking, and delicate texture.",
105:     service:
106:       "Best for hot searing, charcoal grilling, slicing, and small-plate service.",
107:     rows: [
108:       ["FP01", "Secreto", "16/1.1# AVG. ~ 17.5# CS"],
109:       ["FP15", "Jowl Secreto", "16/0.5# AVG. ~ 8# CS"],
110:       ["FP16", "Belly Secreto", "14/1.3# AVG. ~ 18# CS"],
111:     ],
112:   },
113:   "Rump Cap": {
114:     eyebrow: "Selected Cut",
115:     title: "Picanha",
116:     category: "Beef / Wagyu",
117:     image: assetPath("assets/cuts/rump-cap.jpg"),
118:     description:
119:       "A flavorful cap cut selected for its fat cover, rich character, and versatile presentation.",
120:     service:

---- lines 107-135 ----
107:     rows: [
108:       ["FP01", "Secreto", "16/1.1# AVG. ~ 17.5# CS"],
109:       ["FP15", "Jowl Secreto", "16/0.5# AVG. ~ 8# CS"],
110:       ["FP16", "Belly Secreto", "14/1.3# AVG. ~ 18# CS"],
111:     ],
112:   },
113:   "Rump Cap": {
114:     eyebrow: "Selected Cut",
115:     title: "Picanha",
116:     category: "Beef / Wagyu",
117:     image: assetPath("assets/cuts/rump-cap.jpg"),
118:     description:
119:       "A flavorful cap cut selected for its fat cover, rich character, and versatile presentation.",
120:     service:
121:       "Best for roasting, grilling, slicing, and picanha-style service.",
122:     rows: [
123:       ["24124", "Rump Cap", "8/3.5# AVG. ~ 28# CS"],
124:       ["34124", "Rump Cap", "8/3.5# AVG. ~ 28# CS"],
125:       ["37924", "Rump Cap (Culotte)", "8/4# AVG. ~ 34# CS"],
126:       ["2091XA", "Rump Cap", "6/5# AVG. ~ 30# CS"],
127:       ["2091XB", "Rump Cap", "6/5# AVG. ~ 30# CS"],
128:     ],
129:   },
130:   "Short Rib": {
131:     eyebrow: "Selected Cut",
132:     title: "Short Rib",
133:     category: "Beef",
134:     image: assetPath("assets/cuts/short-rib.jpg"),
135:     description:

---- lines 124-152 ----
124:       ["34124", "Rump Cap", "8/3.5# AVG. ~ 28# CS"],
125:       ["37924", "Rump Cap (Culotte)", "8/4# AVG. ~ 34# CS"],
126:       ["2091XA", "Rump Cap", "6/5# AVG. ~ 30# CS"],
127:       ["2091XB", "Rump Cap", "6/5# AVG. ~ 30# CS"],
128:     ],
129:   },
130:   "Short Rib": {
131:     eyebrow: "Selected Cut",
132:     title: "Short Rib",
133:     category: "Beef",
134:     image: assetPath("assets/cuts/short-rib.jpg"),
135:     description:
136:       "A richly flavored cut selected for depth, structure, and satisfying slow-cooked or grilled preparations.",
137:     service:
138:       "Best for braising, smoking, grilling, and Korean-style short rib service.",
139:     rows: [
140:       ["1688XA", "Short Rib 3-Rib", "12/4# AVG. ~ 48# CS"],
141:       ["1688XB", "Short Rib 3-Rib", "8/3# AVG. ~ 48# CS"],
142:     ],
143:   },
144:   "Chuck Roll": {
145:     eyebrow: "Selected Cut",
146:     title: "Chuck Roll",
147:     category: "Wagyu",
148:     image: assetPath("assets/cuts/placeholder-cut.svg"),
149:     description:
150:       "A versatile forequarter cut selected for depth, structure, and a generous flavor profile.",
151:     service:
152:       "Best for roasting, braising, slicing, and refined slow-cooked preparations.",

---- lines 138-166 ----
138:       "Best for braising, smoking, grilling, and Korean-style short rib service.",
139:     rows: [
140:       ["1688XA", "Short Rib 3-Rib", "12/4# AVG. ~ 48# CS"],
141:       ["1688XB", "Short Rib 3-Rib", "8/3# AVG. ~ 48# CS"],
142:     ],
143:   },
144:   "Chuck Roll": {
145:     eyebrow: "Selected Cut",
146:     title: "Chuck Roll",
147:     category: "Wagyu",
148:     image: assetPath("assets/cuts/placeholder-cut.svg"),
149:     description:
150:       "A versatile forequarter cut selected for depth, structure, and a generous flavor profile.",
151:     service:
152:       "Best for roasting, braising, slicing, and refined slow-cooked preparations.",
153:     rows: [
154:       ["34129", "Chuck Roll", "2/20# AVG. ~ 40# CS"],
155:     ],
156:   },
157:   "Shortloin": {
158:     eyebrow: "Selected Cut",
159:     title: "Shortloin",
160:     category: "Wagyu",
161:     image: assetPath("assets/cuts/placeholder-cut.svg"),
162:     description:
163:       "A premium loin section selected for steakhouse utility, balance, and elegant portioning.",
164:     service:
165:       "Best for portioning into high-value steaks, roasting, and composed center-plate service.",
166:     rows: [

---- lines 151-179 ----
151:     service:
152:       "Best for roasting, braising, slicing, and refined slow-cooked preparations.",
153:     rows: [
154:       ["34129", "Chuck Roll", "2/20# AVG. ~ 40# CS"],
155:     ],
156:   },
157:   "Shortloin": {
158:     eyebrow: "Selected Cut",
159:     title: "Shortloin",
160:     category: "Wagyu",
161:     image: assetPath("assets/cuts/placeholder-cut.svg"),
162:     description:
163:       "A premium loin section selected for steakhouse utility, balance, and elegant portioning.",
164:     service:
165:       "Best for portioning into high-value steaks, roasting, and composed center-plate service.",
166:     rows: [
167:       ["24105", "Shortloin", "1/28# AVG. ~ 28# CS"],
168:       ["37975", "Shortloin", "1/22# AVG. ~ 22# CS"],
169:     ],
170:   },
171:   "Flap Meat": {
172:     eyebrow: "Selected Cut",
173:     title: "Flap Meat",
174:     category: "Beef / Wagyu",
175:     image: assetPath("assets/cuts/placeholder-cut.svg"),
176:     description:
177:       "A flavorful, loose-grained cut selected for marbling, quick cooking, and strong menu versatility.",
178:     service:
179:       "Best for grilling, searing, slicing across the grain, and bold steak preparations.",

---- lines 165-193 ----
165:       "Best for portioning into high-value steaks, roasting, and composed center-plate service.",
166:     rows: [
167:       ["24105", "Shortloin", "1/28# AVG. ~ 28# CS"],
168:       ["37975", "Shortloin", "1/22# AVG. ~ 22# CS"],
169:     ],
170:   },
171:   "Flap Meat": {
172:     eyebrow: "Selected Cut",
173:     title: "Flap Meat",
174:     category: "Beef / Wagyu",
175:     image: assetPath("assets/cuts/placeholder-cut.svg"),
176:     description:
177:       "A flavorful, loose-grained cut selected for marbling, quick cooking, and strong menu versatility.",
178:     service:
179:       "Best for grilling, searing, slicing across the grain, and bold steak preparations.",
180:     rows: [
181:       ["14117", "Flap Meat", "8/4.5# AVG. ~ 36# CS"],
182:       ["24117", "Flap Meat", "8/4.5# AVG. ~ 36# CS"],
183:       ["34117", "Flap Meat", "8/4.5# AVG. ~ 36# CS"],
184:       ["37917", "Flap Meat", "8/4# AVG. ~ 35# CS"],
185:       ["22061W", "Flap Meat", "6/5# AVG. ~ 30# CS"],
186:       ["2206XA", "Flap Meat", "6/2.5# AVG. ~ 30# CS"],
187:     ],
188:   },
189:   "Flank Steak": {
190:     eyebrow: "Selected Cut",
191:     title: "Flank Steak",
192:     category: "Beef / Ibérico Pork",
193:     image: assetPath("assets/cuts/placeholder-cut.svg"),

---- lines 183-211 ----
183:       ["34117", "Flap Meat", "8/4.5# AVG. ~ 36# CS"],
184:       ["37917", "Flap Meat", "8/4# AVG. ~ 35# CS"],
185:       ["22061W", "Flap Meat", "6/5# AVG. ~ 30# CS"],
186:       ["2206XA", "Flap Meat", "6/2.5# AVG. ~ 30# CS"],
187:     ],
188:   },
189:   "Flank Steak": {
190:     eyebrow: "Selected Cut",
191:     title: "Flank Steak",
192:     category: "Beef / Ibérico Pork",
193:     image: assetPath("assets/cuts/placeholder-cut.svg"),
194:     description:
195:       "A lean, expressive cut selected for clean slicing, defined texture, and focused flavor.",
196:     service:
197:       "Best for high-heat grilling, marinades, slicing, and shareable plates.",
198:     rows: [
199:       ["FP10", "Flank Steak", "18/1.2# AVG. ~ 21# CS"],
200:       ["2210XA", "Flank Steak", "12/1.5# AVG. ~ 36# CS"],
201:     ],
202:   },
203:   "Tri Tip": {
204:     eyebrow: "Selected Cut",
205:     title: "Tri Tip",
206:     category: "Beef / Wagyu",
207:     image: assetPath("assets/cuts/placeholder-cut.svg"),
208:     description:
209:       "A compact sirloin cut selected for roastability, flavor concentration, and broad service flexibility.",
210:     service:
211:       "Best for roasting, grilling, carving, and premium sliced presentations.",

---- lines 197-225 ----
197:       "Best for high-heat grilling, marinades, slicing, and shareable plates.",
198:     rows: [
199:       ["FP10", "Flank Steak", "18/1.2# AVG. ~ 21# CS"],
200:       ["2210XA", "Flank Steak", "12/1.5# AVG. ~ 36# CS"],
201:     ],
202:   },
203:   "Tri Tip": {
204:     eyebrow: "Selected Cut",
205:     title: "Tri Tip",
206:     category: "Beef / Wagyu",
207:     image: assetPath("assets/cuts/placeholder-cut.svg"),
208:     description:
209:       "A compact sirloin cut selected for roastability, flavor concentration, and broad service flexibility.",
210:     service:
211:       "Best for roasting, grilling, carving, and premium sliced presentations.",
212:     rows: [
213:       ["14116", "Tri Tip", "16/2.25# AVG. ~ 36# CS"],
214:       ["24116", "Tri Tip", "16/2.25# AVG. ~ 36# CS"],
215:       ["34116", "Tri Tip", "16/2.25# AVG. ~ 36# CS"],
216:       ["37916", "Tri Tip", "12/3# AVG. ~ 33# CS"],
217:       ["21311W", "Tri Tip", "12/3# AVG. ~ 36# CS"],
218:       ["2131XA", "Tri Tip", "4/2# AVG. ~ 32# CS"],
219:     ],
220:   },
221:   "Top Sirloin": {
222:     eyebrow: "Selected Cut",
223:     title: "Top Sirloin",
224:     category: "Beef / Wagyu",
225:     image: assetPath("assets/cuts/placeholder-cut.svg"),

---- lines 215-243 ----
215:       ["34116", "Tri Tip", "16/2.25# AVG. ~ 36# CS"],
216:       ["37916", "Tri Tip", "12/3# AVG. ~ 33# CS"],
217:       ["21311W", "Tri Tip", "12/3# AVG. ~ 36# CS"],
218:       ["2131XA", "Tri Tip", "4/2# AVG. ~ 32# CS"],
219:     ],
220:   },
221:   "Top Sirloin": {
222:     eyebrow: "Selected Cut",
223:     title: "Top Sirloin",
224:     category: "Beef / Wagyu",
225:     image: assetPath("assets/cuts/placeholder-cut.svg"),
226:     description:
227:       "A reliable premium cut selected for lean structure, clean flavor, and adaptable service.",
228:     service:
229:       "Best for steaks, grilling, roasting, and consistent portion control.",
230:     rows: [
231:       ["24123", "Top Sirloin", "4/8# AVG. ~ 32# CS"],
232:       ["34123", "Top Sirloin", "4/8# AVG. ~ 32# CS"],
233:       ["21102W", "Top Sirloin", "3/16# AVG. ~ 48# CS"],
234:       ["2110XA", "Top Sirloin", "6/6# AVG. ~ 36# CS"],
235:       ["2110XB", "Top Sirloin", "6/6# AVG. ~ 36# CS"],
236:     ],
237:   },
238:   "Oyster Blade": {
239:     eyebrow: "Selected Cut",
240:     title: "Oyster Blade",
241:     category: "Wagyu",
242:     image: assetPath("assets/cuts/placeholder-cut.svg"),
243:     description:

---- lines 232-260 ----
232:       ["34123", "Top Sirloin", "4/8# AVG. ~ 32# CS"],
233:       ["21102W", "Top Sirloin", "3/16# AVG. ~ 48# CS"],
234:       ["2110XA", "Top Sirloin", "6/6# AVG. ~ 36# CS"],
235:       ["2110XB", "Top Sirloin", "6/6# AVG. ~ 36# CS"],
236:     ],
237:   },
238:   "Oyster Blade": {
239:     eyebrow: "Selected Cut",
240:     title: "Oyster Blade",
241:     category: "Wagyu",
242:     image: assetPath("assets/cuts/placeholder-cut.svg"),
243:     description:
244:       "A shoulder cut selected for tenderness potential, rich flavor, and refined preparation range.",
245:     service:
246:       "Best for slow cooking, roasting, slicing, and carefully trimmed steak applications.",
247:     rows: [
248:       ["37932", "Oyster Blade", "8/6# AVG. ~ 49# CS"],
249:     ],
250:   },
251:   "Chuck Tail Flap": {
252:     eyebrow: "Selected Cut",
253:     title: "Chuck Tail Flap",
254:     category: "Beef / Wagyu",
255:     image: assetPath("assets/cuts/placeholder-cut.svg"),
256:     description:
257:       "A deeply flavored cut selected for marbling, texture, and strong culinary flexibility.",
258:     service:
259:       "Best for grilling, searing, slicing, and rich center-plate features.",
260:     rows: [

---- lines 245-273 ----
245:     service:
246:       "Best for slow cooking, roasting, slicing, and carefully trimmed steak applications.",
247:     rows: [
248:       ["37932", "Oyster Blade", "8/6# AVG. ~ 49# CS"],
249:     ],
250:   },
251:   "Chuck Tail Flap": {
252:     eyebrow: "Selected Cut",
253:     title: "Chuck Tail Flap",
254:     category: "Beef / Wagyu",
255:     image: assetPath("assets/cuts/placeholder-cut.svg"),
256:     description:
257:       "A deeply flavored cut selected for marbling, texture, and strong culinary flexibility.",
258:     service:
259:       "Best for grilling, searing, slicing, and rich center-plate features.",
260:     rows: [
261:       ["14142", "Chuck Tail Flap", "3/13# AVG. ~ 40# CS"],
262:       ["24142", "Chuck Tail Flap", "12/2.5# AVG. ~ 30# CS"],
263:       ["34142", "Chuck Tail Flap", "12/2.5# AVG. ~ 30# CS"],
264:       ["37942", "Chuck Tail Flap", "12/3# AVG. ~ 35# CS"],
265:       ["2266GS", "Chuck Tail Flap", "5/7# AVG. ~ 35# CS"],
266:     ],
267:   },
268:   "Iberico Abanico": {
269:     eyebrow: "Selected Cut",
270:     title: "Iberico Abanico",
271:     category: "Ibérico Pork",
272:     image: assetPath("assets/cuts/placeholder-cut.svg"),
273:     description:

---- lines 262-290 ----
262:       ["24142", "Chuck Tail Flap", "12/2.5# AVG. ~ 30# CS"],
263:       ["34142", "Chuck Tail Flap", "12/2.5# AVG. ~ 30# CS"],
264:       ["37942", "Chuck Tail Flap", "12/3# AVG. ~ 35# CS"],
265:       ["2266GS", "Chuck Tail Flap", "5/7# AVG. ~ 35# CS"],
266:     ],
267:   },
268:   "Iberico Abanico": {
269:     eyebrow: "Selected Cut",
270:     title: "Iberico Abanico",
271:     category: "Ibérico Pork",
272:     image: assetPath("assets/cuts/placeholder-cut.svg"),
273:     description:
274:       "A prized Ibérico cut selected for expressive marbling, rich flavor, and refined Spanish character.",
275:     service:
276:       "Best for high-heat searing, charcoal grilling, slicing, and premium shared plates.",
277:     rows: [
278:       ["FP03", "Albanico", "18/1.1# AVG. ~ 19.8# CS"],
279:     ],
280:   },
281:   "Iberico Pluma": {
282:     eyebrow: "Selected Cut",
283:     title: "Iberico Pluma",
284:     category: "Ibérico Pork",
285:     image: assetPath("assets/cuts/placeholder-cut.svg"),
286:     description:
287:       "A delicate Ibérico cut selected for tenderness, elegant fat distribution, and a clean finishing profile.",
288:     service:
289:       "Best for grilling, searing, slicing thinly, and refined small-plate service.",
290:     rows: [

---- lines 275-303 ----
275:     service:
276:       "Best for high-heat searing, charcoal grilling, slicing, and premium shared plates.",
277:     rows: [
278:       ["FP03", "Albanico", "18/1.1# AVG. ~ 19.8# CS"],
279:     ],
280:   },
281:   "Iberico Pluma": {
282:     eyebrow: "Selected Cut",
283:     title: "Iberico Pluma",
284:     category: "Ibérico Pork",
285:     image: assetPath("assets/cuts/placeholder-cut.svg"),
286:     description:
287:       "A delicate Ibérico cut selected for tenderness, elegant fat distribution, and a clean finishing profile.",
288:     service:
289:       "Best for grilling, searing, slicing thinly, and refined small-plate service.",
290:     rows: [
291:       ["FP04", "Pluma", "12/1.5# AVG. ~ 18.5# CS"],
292:     ],
293:   },
294:   "Iberico Coppa": {
295:     eyebrow: "Selected Cut",
296:     title: "Iberico Coppa",
297:     category: "Ibérico Pork",
298:     image: assetPath("assets/cuts/placeholder-cut.svg"),
299:     description:
300:       "A deeply flavored shoulder cut selected for marbling, structure, and generous culinary versatility.",
301:     service:
302:       "Best for roasting, slow cooking, slicing, and rich center-plate preparations.",
303:     rows: [

---- lines 288-316 ----
288:     service:
289:       "Best for grilling, searing, slicing thinly, and refined small-plate service.",
290:     rows: [
291:       ["FP04", "Pluma", "12/1.5# AVG. ~ 18.5# CS"],
292:     ],
293:   },
294:   "Iberico Coppa": {
295:     eyebrow: "Selected Cut",
296:     title: "Iberico Coppa",
297:     category: "Ibérico Pork",
298:     image: assetPath("assets/cuts/placeholder-cut.svg"),
299:     description:
300:       "A deeply flavored shoulder cut selected for marbling, structure, and generous culinary versatility.",
301:     service:
302:       "Best for roasting, slow cooking, slicing, and rich center-plate preparations.",
303:     rows: [
304:       ["FP08", "Coppa", "8/2.3# AVG. ~ 18# CS"],
305:     ],
306:   },
307:   "Iberico Loin Roast": {
308:     eyebrow: "Selected Cut",
309:     title: "Iberico Loin Roast",
310:     category: "Ibérico Pork",
311:     image: assetPath("assets/cuts/placeholder-cut.svg"),
312:     description:
313:       "A refined Ibérico roast selected for balanced texture, clean presentation, and understated richness.",
314:     service:
315:       "Best for roasting, carving, composed plates, and elegant banquet-style service.",
316:     rows: [

---- lines 301-329 ----
301:     service:
302:       "Best for roasting, slow cooking, slicing, and rich center-plate preparations.",
303:     rows: [
304:       ["FP08", "Coppa", "8/2.3# AVG. ~ 18# CS"],
305:     ],
306:   },
307:   "Iberico Loin Roast": {
308:     eyebrow: "Selected Cut",
309:     title: "Iberico Loin Roast",
310:     category: "Ibérico Pork",
311:     image: assetPath("assets/cuts/placeholder-cut.svg"),
312:     description:
313:       "A refined Ibérico roast selected for balanced texture, clean presentation, and understated richness.",
314:     service:
315:       "Best for roasting, carving, composed plates, and elegant banquet-style service.",
316:     rows: [
317:       ["FP07", "Loin Roast", "12/1.25# AVG. ~ 15# CS"],
318:     ],
319:   },
320:   "Iberico 4 Rib-Rack": {
321:     eyebrow: "Selected Cut",
322:     title: "Iberico 4 Rib-Rack",
323:     category: "Ibérico Pork",
324:     image: assetPath("assets/cuts/placeholder-cut.svg"),
325:     description:
326:       "A presentation-focused Ibérico rack selected for visual impact, marbling, and heritage pork flavor.",
327:     service:
328:       "Best for roasting, grilling, carving tableside, and premium menu features.",
329:     rows: [

---- lines 314-342 ----
314:     service:
315:       "Best for roasting, carving, composed plates, and elegant banquet-style service.",
316:     rows: [
317:       ["FP07", "Loin Roast", "12/1.25# AVG. ~ 15# CS"],
318:     ],
319:   },
320:   "Iberico 4 Rib-Rack": {
321:     eyebrow: "Selected Cut",
322:     title: "Iberico 4 Rib-Rack",
323:     category: "Ibérico Pork",
324:     image: assetPath("assets/cuts/placeholder-cut.svg"),
325:     description:
326:       "A presentation-focused Ibérico rack selected for visual impact, marbling, and heritage pork flavor.",
327:     service:
328:       "Best for roasting, grilling, carving tableside, and premium menu features.",
329:     rows: [
330:       ["FP05", "4-Rib Rack", "6/2.1# AVG. ~ 13# CS"],
331:     ],
332:   },
333:   "Iberico St. Louis Ribs": {
334:     eyebrow: "Selected Cut",
335:     title: "Iberico St. Louis Ribs",
336:     category: "Ibérico Pork",
337:     image: assetPath("assets/cuts/placeholder-cut.svg"),
338:     description:
339:       "A flavorful rib cut selected for richness, structure, and a distinctive Ibérico eating profile.",
340:     service:
341:       "Best for smoking, roasting, glazing, grilling, and elevated rib service.",
342:     rows: [

---- lines 327-355 ----
327:     service:
328:       "Best for roasting, grilling, carving tableside, and premium menu features.",
329:     rows: [
330:       ["FP05", "4-Rib Rack", "6/2.1# AVG. ~ 13# CS"],
331:     ],
332:   },
333:   "Iberico St. Louis Ribs": {
334:     eyebrow: "Selected Cut",
335:     title: "Iberico St. Louis Ribs",
336:     category: "Ibérico Pork",
337:     image: assetPath("assets/cuts/placeholder-cut.svg"),
338:     description:
339:       "A flavorful rib cut selected for richness, structure, and a distinctive Ibérico eating profile.",
340:     service:
341:       "Best for smoking, roasting, glazing, grilling, and elevated rib service.",
342:     rows: [
343:       ["FP09", "St. Louis Rib", "6/1.8# AVG. ~ 11# CS"],
344:     ],
345:   },
346:   "Iberico Pork Belly": {
347:     eyebrow: "Selected Cut",
348:     title: "Iberico Pork Belly",
349:     category: "Ibérico Pork",
350:     image: assetPath("assets/cuts/placeholder-cut.svg"),
351:     description:
352:       "A richly marbled belly cut selected for depth, texture, and luxurious rendered flavor.",
353:     service:
354:       "Best for roasting, slow cooking, crisping, slicing, and composed pork plates.",
355:     rows: [

---- lines 340-368 ----
340:     service:
341:       "Best for smoking, roasting, glazing, grilling, and elevated rib service.",
342:     rows: [
343:       ["FP09", "St. Louis Rib", "6/1.8# AVG. ~ 11# CS"],
344:     ],
345:   },
346:   "Iberico Pork Belly": {
347:     eyebrow: "Selected Cut",
348:     title: "Iberico Pork Belly",
349:     category: "Ibérico Pork",
350:     image: assetPath("assets/cuts/placeholder-cut.svg"),
351:     description:
352:       "A richly marbled belly cut selected for depth, texture, and luxurious rendered flavor.",
353:     service:
354:       "Best for roasting, slow cooking, crisping, slicing, and composed pork plates.",
355:     rows: [
356:       ["FP06", "Belly", "12/1.25# AVG. ~ 15# CS"],
357:     ],
358:   },
359:   "Iberico Shoulder Picnic": {
360:     eyebrow: "Selected Cut",
361:     title: "Iberico Shoulder Picnic",
362:     category: "Ibérico Pork",
363:     image: assetPath("assets/cuts/placeholder-cut.svg"),
364:     description:
365:       "A hearty Ibérico shoulder cut selected for depth, slow-cooked tenderness, and bold savory character.",
366:     service:
367:       "Best for braising, roasting, smoking, pulling, and generous shared preparations.",
368:     rows: [

---- lines 342-370 ----
342:     rows: [
343:       ["FP09", "St. Louis Rib", "6/1.8# AVG. ~ 11# CS"],
344:     ],
345:   },
346:   "Iberico Pork Belly": {
347:     eyebrow: "Selected Cut",
348:     title: "Iberico Pork Belly",
349:     category: "Ibérico Pork",
350:     image: assetPath("assets/cuts/placeholder-cut.svg"),
351:     description:
352:       "A richly marbled belly cut selected for depth, texture, and luxurious rendered flavor.",
353:     service:
354:       "Best for roasting, slow cooking, crisping, slicing, and composed pork plates.",
355:     rows: [
356:       ["FP06", "Belly", "12/1.25# AVG. ~ 15# CS"],
357:     ],
358:   },
359:   "Iberico Shoulder Picnic": {
360:     eyebrow: "Selected Cut",
361:     title: "Iberico Shoulder Picnic",
362:     category: "Ibérico Pork",
363:     image: assetPath("assets/cuts/placeholder-cut.svg"),
364:     description:
365:       "A hearty Ibérico shoulder cut selected for depth, slow-cooked tenderness, and bold savory character.",
366:     service:
367:       "Best for braising, roasting, smoking, pulling, and generous shared preparations.",
368:     rows: [
369:       ["FP21", "Picnic Shoulder", "2/16# AVG. ~ 32# CS"],
370:     ],

---- lines 353-381 ----
353:     service:
354:       "Best for roasting, slow cooking, crisping, slicing, and composed pork plates.",
355:     rows: [
356:       ["FP06", "Belly", "12/1.25# AVG. ~ 15# CS"],
357:     ],
358:   },
359:   "Iberico Shoulder Picnic": {
360:     eyebrow: "Selected Cut",
361:     title: "Iberico Shoulder Picnic",
362:     category: "Ibérico Pork",
363:     image: assetPath("assets/cuts/placeholder-cut.svg"),
364:     description:
365:       "A hearty Ibérico shoulder cut selected for depth, slow-cooked tenderness, and bold savory character.",
366:     service:
367:       "Best for braising, roasting, smoking, pulling, and generous shared preparations.",
368:     rows: [
369:       ["FP21", "Picnic Shoulder", "2/16# AVG. ~ 32# CS"],
370:     ],
371:   },
372: };
373: 
374: const escapeHtml = (value) =>
375:   String(value)
376:     .replaceAll("&", "&amp;")
377:     .replaceAll("<", "&lt;")
378:     .replaceAll(">", "&gt;")
379:     .replaceAll('"', "&quot;")
380:     .replaceAll("'", "&#039;");
381: 

---- lines 415-443 ----
415:   "Iberico Pluma": "iberico-pluma",
416:   "Iberico Coppa": "iberico-coppa",
417:   "Iberico Loin Roast": "iberico-loin-roast",
418:   "Iberico 4 Rib-Rack": "iberico-4-rib-rack",
419:   "Iberico St. Louis Ribs": "iberico-st-louis-ribs",
420:   "Iberico Pork Belly": "iberico-pork-belly",
421:   "Iberico Shoulder Picnic": "iberico-shoulder-picnic",
422: };
423: 
424: const getConnectedProducersForCut = (cutName) => {
425:   const cut = selectedCuts[cutName];
426:   const cutId = selectedCutTitleToId[cutName] || selectedCutTitleToId[cut?.title];
427: 
428:   if (!cutId) {
429:     return [];
430:   }
431: 
432:   return producers.filter((producer) => (producerCutLinks[producer.id] || []).includes(cutId));
433: };
434: 
435: const createProducerProgramLinks = (cutName) => {
436:   const relatedProducers = getConnectedProducersForCut(cutName);
437: 
438:   if (relatedProducers.length === 0) {
439:     return "";
440:   }
441: 
442:   const buttons = relatedProducers
443:     .map(

---- lines 436-464 ----
436:   const relatedProducers = getConnectedProducersForCut(cutName);
437: 
438:   if (relatedProducers.length === 0) {
439:     return "";
440:   }
441: 
442:   const buttons = relatedProducers
443:     .map(
444:       (producer) => `
445:         <button
446:           class="selected-cut-modal__producer-button"
447:           type="button"
448:           data-connected-producer-trigger="${escapeHtml(producer.productListTitle)}"
449:         >
450:           <span>${escapeHtml(producer.publicLabel)}</span>
451:           <small>View Producer</small>
452:         </button>
453:       `,
454:     )
455:     .join("");
456: 
457:   return `
458:     <section class="selected-cut-modal__producer-links" aria-label="Available producer programs">
459:       <div class="selected-cut-modal__producer-links-head">
460:         <span>Producer Programs</span>
461:         <p>Producer programs for this cut.</p>
462:       </div>
463:       <div class="selected-cut-modal__producer-links-list">
464:         ${buttons}

---- lines 448-476 ----
448:           data-connected-producer-trigger="${escapeHtml(producer.productListTitle)}"
449:         >
450:           <span>${escapeHtml(producer.publicLabel)}</span>
451:           <small>View Producer</small>
452:         </button>
453:       `,
454:     )
455:     .join("");
456: 
457:   return `
458:     <section class="selected-cut-modal__producer-links" aria-label="Available producer programs">
459:       <div class="selected-cut-modal__producer-links-head">
460:         <span>Producer Programs</span>
461:         <p>Producer programs for this cut.</p>
462:       </div>
463:       <div class="selected-cut-modal__producer-links-list">
464:         ${buttons}
465:       </div>
466:     </section>
467:   `;
468: };
469: // CONNECTED_CATALOG_CUT_TO_PRODUCER_HELPERS_END
470: export function initSelectedCutsModal() {
471:   const modalContent = `
472:     <div class="selected-cut-modal__panel">
473:       <button class="selected-cut-modal__close" type="button" aria-label="Close selected cut details" data-selected-cut-close>
474:         <span aria-hidden="true">×</span>
475:       </button>
476: 

---- lines 449-477 ----
449:         >
450:           <span>${escapeHtml(producer.publicLabel)}</span>
451:           <small>View Producer</small>
452:         </button>
453:       `,
454:     )
455:     .join("");
456: 
457:   return `
458:     <section class="selected-cut-modal__producer-links" aria-label="Available producer programs">
459:       <div class="selected-cut-modal__producer-links-head">
460:         <span>Producer Programs</span>
461:         <p>Producer programs for this cut.</p>
462:       </div>
463:       <div class="selected-cut-modal__producer-links-list">
464:         ${buttons}
465:       </div>
466:     </section>
467:   `;
468: };
469: // CONNECTED_CATALOG_CUT_TO_PRODUCER_HELPERS_END
470: export function initSelectedCutsModal() {
471:   const modalContent = `
472:     <div class="selected-cut-modal__panel">
473:       <button class="selected-cut-modal__close" type="button" aria-label="Close selected cut details" data-selected-cut-close>
474:         <span aria-hidden="true">×</span>
475:       </button>
476: 
477:       <div class="selected-cut-modal__body">

---- lines 453-481 ----
453:       `,
454:     )
455:     .join("");
456: 
457:   return `
458:     <section class="selected-cut-modal__producer-links" aria-label="Available producer programs">
459:       <div class="selected-cut-modal__producer-links-head">
460:         <span>Producer Programs</span>
461:         <p>Producer programs for this cut.</p>
462:       </div>
463:       <div class="selected-cut-modal__producer-links-list">
464:         ${buttons}
465:       </div>
466:     </section>
467:   `;
468: };
469: // CONNECTED_CATALOG_CUT_TO_PRODUCER_HELPERS_END
470: export function initSelectedCutsModal() {
471:   const modalContent = `
472:     <div class="selected-cut-modal__panel">
473:       <button class="selected-cut-modal__close" type="button" aria-label="Close selected cut details" data-selected-cut-close>
474:         <span aria-hidden="true">×</span>
475:       </button>
476: 
477:       <div class="selected-cut-modal__body">
478:         <figure class="selected-cut-modal__media">
479:           <img data-selected-cut-image src="" alt="" loading="lazy" />
480:           <figcaption data-selected-cut-fallback>Selected Cut</figcaption>
481:         </figure>

---- lines 460-488 ----
460:         <span>Producer Programs</span>
461:         <p>Producer programs for this cut.</p>
462:       </div>
463:       <div class="selected-cut-modal__producer-links-list">
464:         ${buttons}
465:       </div>
466:     </section>
467:   `;
468: };
469: // CONNECTED_CATALOG_CUT_TO_PRODUCER_HELPERS_END
470: export function initSelectedCutsModal() {
471:   const modalContent = `
472:     <div class="selected-cut-modal__panel">
473:       <button class="selected-cut-modal__close" type="button" aria-label="Close selected cut details" data-selected-cut-close>
474:         <span aria-hidden="true">×</span>
475:       </button>
476: 
477:       <div class="selected-cut-modal__body">
478:         <figure class="selected-cut-modal__media">
479:           <img data-selected-cut-image src="" alt="" loading="lazy" />
480:           <figcaption data-selected-cut-fallback>Selected Cut</figcaption>
481:         </figure>
482: 
483:         <section class="selected-cut-modal__content">
484:           <p class="selected-cut-modal__eyebrow" data-selected-cut-eyebrow>Selected Cut</p>
485:           <h2 id="selected-cut-modal-title" data-selected-cut-title>Selected Cut</h2>
486:           <p class="selected-cut-modal__category" data-selected-cut-category></p>
487:           <p class="selected-cut-modal__description" data-selected-cut-description></p>
488: 

---- lines 461-489 ----
461:         <p>Producer programs for this cut.</p>
462:       </div>
463:       <div class="selected-cut-modal__producer-links-list">
464:         ${buttons}
465:       </div>
466:     </section>
467:   `;
468: };
469: // CONNECTED_CATALOG_CUT_TO_PRODUCER_HELPERS_END
470: export function initSelectedCutsModal() {
471:   const modalContent = `
472:     <div class="selected-cut-modal__panel">
473:       <button class="selected-cut-modal__close" type="button" aria-label="Close selected cut details" data-selected-cut-close>
474:         <span aria-hidden="true">×</span>
475:       </button>
476: 
477:       <div class="selected-cut-modal__body">
478:         <figure class="selected-cut-modal__media">
479:           <img data-selected-cut-image src="" alt="" loading="lazy" />
480:           <figcaption data-selected-cut-fallback>Selected Cut</figcaption>
481:         </figure>
482: 
483:         <section class="selected-cut-modal__content">
484:           <p class="selected-cut-modal__eyebrow" data-selected-cut-eyebrow>Selected Cut</p>
485:           <h2 id="selected-cut-modal-title" data-selected-cut-title>Selected Cut</h2>
486:           <p class="selected-cut-modal__category" data-selected-cut-category></p>
487:           <p class="selected-cut-modal__description" data-selected-cut-description></p>
488: 
489:           <div class="selected-cut-modal__note">

---- lines 462-490 ----
462:       </div>
463:       <div class="selected-cut-modal__producer-links-list">
464:         ${buttons}
465:       </div>
466:     </section>
467:   `;
468: };
469: // CONNECTED_CATALOG_CUT_TO_PRODUCER_HELPERS_END
470: export function initSelectedCutsModal() {
471:   const modalContent = `
472:     <div class="selected-cut-modal__panel">
473:       <button class="selected-cut-modal__close" type="button" aria-label="Close selected cut details" data-selected-cut-close>
474:         <span aria-hidden="true">×</span>
475:       </button>
476: 
477:       <div class="selected-cut-modal__body">
478:         <figure class="selected-cut-modal__media">
479:           <img data-selected-cut-image src="" alt="" loading="lazy" />
480:           <figcaption data-selected-cut-fallback>Selected Cut</figcaption>
481:         </figure>
482: 
483:         <section class="selected-cut-modal__content">
484:           <p class="selected-cut-modal__eyebrow" data-selected-cut-eyebrow>Selected Cut</p>
485:           <h2 id="selected-cut-modal-title" data-selected-cut-title>Selected Cut</h2>
486:           <p class="selected-cut-modal__category" data-selected-cut-category></p>
487:           <p class="selected-cut-modal__description" data-selected-cut-description></p>
488: 
489:           <div class="selected-cut-modal__note">
490:             <span>Service Note</span>

---- lines 463-491 ----
463:       <div class="selected-cut-modal__producer-links-list">
464:         ${buttons}
465:       </div>
466:     </section>
467:   `;
468: };
469: // CONNECTED_CATALOG_CUT_TO_PRODUCER_HELPERS_END
470: export function initSelectedCutsModal() {
471:   const modalContent = `
472:     <div class="selected-cut-modal__panel">
473:       <button class="selected-cut-modal__close" type="button" aria-label="Close selected cut details" data-selected-cut-close>
474:         <span aria-hidden="true">×</span>
475:       </button>
476: 
477:       <div class="selected-cut-modal__body">
478:         <figure class="selected-cut-modal__media">
479:           <img data-selected-cut-image src="" alt="" loading="lazy" />
480:           <figcaption data-selected-cut-fallback>Selected Cut</figcaption>
481:         </figure>
482: 
483:         <section class="selected-cut-modal__content">
484:           <p class="selected-cut-modal__eyebrow" data-selected-cut-eyebrow>Selected Cut</p>
485:           <h2 id="selected-cut-modal-title" data-selected-cut-title>Selected Cut</h2>
486:           <p class="selected-cut-modal__category" data-selected-cut-category></p>
487:           <p class="selected-cut-modal__description" data-selected-cut-description></p>
488: 
489:           <div class="selected-cut-modal__note">
490:             <span>Service Note</span>
491:             <p data-selected-cut-service></p>

---- lines 467-495 ----
467:   `;
468: };
469: // CONNECTED_CATALOG_CUT_TO_PRODUCER_HELPERS_END
470: export function initSelectedCutsModal() {
471:   const modalContent = `
472:     <div class="selected-cut-modal__panel">
473:       <button class="selected-cut-modal__close" type="button" aria-label="Close selected cut details" data-selected-cut-close>
474:         <span aria-hidden="true">×</span>
475:       </button>
476: 
477:       <div class="selected-cut-modal__body">
478:         <figure class="selected-cut-modal__media">
479:           <img data-selected-cut-image src="" alt="" loading="lazy" />
480:           <figcaption data-selected-cut-fallback>Selected Cut</figcaption>
481:         </figure>
482: 
483:         <section class="selected-cut-modal__content">
484:           <p class="selected-cut-modal__eyebrow" data-selected-cut-eyebrow>Selected Cut</p>
485:           <h2 id="selected-cut-modal-title" data-selected-cut-title>Selected Cut</h2>
486:           <p class="selected-cut-modal__category" data-selected-cut-category></p>
487:           <p class="selected-cut-modal__description" data-selected-cut-description></p>
488: 
489:           <div class="selected-cut-modal__note">
490:             <span>Service Note</span>
491:             <p data-selected-cut-service></p>
492:           </div>
493: 
494:           <div class="selected-cut-modal__producer-links-slot" data-selected-cut-producers></div>
495: 

---- lines 468-496 ----
468: };
469: // CONNECTED_CATALOG_CUT_TO_PRODUCER_HELPERS_END
470: export function initSelectedCutsModal() {
471:   const modalContent = `
472:     <div class="selected-cut-modal__panel">
473:       <button class="selected-cut-modal__close" type="button" aria-label="Close selected cut details" data-selected-cut-close>
474:         <span aria-hidden="true">×</span>
475:       </button>
476: 
477:       <div class="selected-cut-modal__body">
478:         <figure class="selected-cut-modal__media">
479:           <img data-selected-cut-image src="" alt="" loading="lazy" />
480:           <figcaption data-selected-cut-fallback>Selected Cut</figcaption>
481:         </figure>
482: 
483:         <section class="selected-cut-modal__content">
484:           <p class="selected-cut-modal__eyebrow" data-selected-cut-eyebrow>Selected Cut</p>
485:           <h2 id="selected-cut-modal-title" data-selected-cut-title>Selected Cut</h2>
486:           <p class="selected-cut-modal__category" data-selected-cut-category></p>
487:           <p class="selected-cut-modal__description" data-selected-cut-description></p>
488: 
489:           <div class="selected-cut-modal__note">
490:             <span>Service Note</span>
491:             <p data-selected-cut-service></p>
492:           </div>
493: 
494:           <div class="selected-cut-modal__producer-links-slot" data-selected-cut-producers></div>
495: 
496:           <div class="selected-cut-modal__table-wrap">

---- lines 469-497 ----
469: // CONNECTED_CATALOG_CUT_TO_PRODUCER_HELPERS_END
470: export function initSelectedCutsModal() {
471:   const modalContent = `
472:     <div class="selected-cut-modal__panel">
473:       <button class="selected-cut-modal__close" type="button" aria-label="Close selected cut details" data-selected-cut-close>
474:         <span aria-hidden="true">×</span>
475:       </button>
476: 
477:       <div class="selected-cut-modal__body">
478:         <figure class="selected-cut-modal__media">
479:           <img data-selected-cut-image src="" alt="" loading="lazy" />
480:           <figcaption data-selected-cut-fallback>Selected Cut</figcaption>
481:         </figure>
482: 
483:         <section class="selected-cut-modal__content">
484:           <p class="selected-cut-modal__eyebrow" data-selected-cut-eyebrow>Selected Cut</p>
485:           <h2 id="selected-cut-modal-title" data-selected-cut-title>Selected Cut</h2>
486:           <p class="selected-cut-modal__category" data-selected-cut-category></p>
487:           <p class="selected-cut-modal__description" data-selected-cut-description></p>
488: 
489:           <div class="selected-cut-modal__note">
490:             <span>Service Note</span>
491:             <p data-selected-cut-service></p>
492:           </div>
493: 
494:           <div class="selected-cut-modal__producer-links-slot" data-selected-cut-producers></div>
495: 
496:           <div class="selected-cut-modal__table-wrap">
497:             <table class="selected-cut-modal__table">

---- lines 470-498 ----
470: export function initSelectedCutsModal() {
471:   const modalContent = `
472:     <div class="selected-cut-modal__panel">
473:       <button class="selected-cut-modal__close" type="button" aria-label="Close selected cut details" data-selected-cut-close>
474:         <span aria-hidden="true">×</span>
475:       </button>
476: 
477:       <div class="selected-cut-modal__body">
478:         <figure class="selected-cut-modal__media">
479:           <img data-selected-cut-image src="" alt="" loading="lazy" />
480:           <figcaption data-selected-cut-fallback>Selected Cut</figcaption>
481:         </figure>
482: 
483:         <section class="selected-cut-modal__content">
484:           <p class="selected-cut-modal__eyebrow" data-selected-cut-eyebrow>Selected Cut</p>
485:           <h2 id="selected-cut-modal-title" data-selected-cut-title>Selected Cut</h2>
486:           <p class="selected-cut-modal__category" data-selected-cut-category></p>
487:           <p class="selected-cut-modal__description" data-selected-cut-description></p>
488: 
489:           <div class="selected-cut-modal__note">
490:             <span>Service Note</span>
491:             <p data-selected-cut-service></p>
492:           </div>
493: 
494:           <div class="selected-cut-modal__producer-links-slot" data-selected-cut-producers></div>
495: 
496:           <div class="selected-cut-modal__table-wrap">
497:             <table class="selected-cut-modal__table">
498:               <thead>

---- lines 473-501 ----
473:       <button class="selected-cut-modal__close" type="button" aria-label="Close selected cut details" data-selected-cut-close>
474:         <span aria-hidden="true">×</span>
475:       </button>
476: 
477:       <div class="selected-cut-modal__body">
478:         <figure class="selected-cut-modal__media">
479:           <img data-selected-cut-image src="" alt="" loading="lazy" />
480:           <figcaption data-selected-cut-fallback>Selected Cut</figcaption>
481:         </figure>
482: 
483:         <section class="selected-cut-modal__content">
484:           <p class="selected-cut-modal__eyebrow" data-selected-cut-eyebrow>Selected Cut</p>
485:           <h2 id="selected-cut-modal-title" data-selected-cut-title>Selected Cut</h2>
486:           <p class="selected-cut-modal__category" data-selected-cut-category></p>
487:           <p class="selected-cut-modal__description" data-selected-cut-description></p>
488: 
489:           <div class="selected-cut-modal__note">
490:             <span>Service Note</span>
491:             <p data-selected-cut-service></p>
492:           </div>
493: 
494:           <div class="selected-cut-modal__producer-links-slot" data-selected-cut-producers></div>
495: 
496:           <div class="selected-cut-modal__table-wrap">
497:             <table class="selected-cut-modal__table">
498:               <thead>
499:                 <tr>
500:                   <th scope="col">Code</th>
501:                   <th scope="col">Cut / Product</th>

---- lines 474-502 ----
474:         <span aria-hidden="true">×</span>
475:       </button>
476: 
477:       <div class="selected-cut-modal__body">
478:         <figure class="selected-cut-modal__media">
479:           <img data-selected-cut-image src="" alt="" loading="lazy" />
480:           <figcaption data-selected-cut-fallback>Selected Cut</figcaption>
481:         </figure>
482: 
483:         <section class="selected-cut-modal__content">
484:           <p class="selected-cut-modal__eyebrow" data-selected-cut-eyebrow>Selected Cut</p>
485:           <h2 id="selected-cut-modal-title" data-selected-cut-title>Selected Cut</h2>
486:           <p class="selected-cut-modal__category" data-selected-cut-category></p>
487:           <p class="selected-cut-modal__description" data-selected-cut-description></p>
488: 
489:           <div class="selected-cut-modal__note">
490:             <span>Service Note</span>
491:             <p data-selected-cut-service></p>
492:           </div>
493: 
494:           <div class="selected-cut-modal__producer-links-slot" data-selected-cut-producers></div>
495: 
496:           <div class="selected-cut-modal__table-wrap">
497:             <table class="selected-cut-modal__table">
498:               <thead>
499:                 <tr>
500:                   <th scope="col">Code</th>
501:                   <th scope="col">Cut / Product</th>
502:                   <th scope="col">Specification</th>

---- lines 475-503 ----
475:       </button>
476: 
477:       <div class="selected-cut-modal__body">
478:         <figure class="selected-cut-modal__media">
479:           <img data-selected-cut-image src="" alt="" loading="lazy" />
480:           <figcaption data-selected-cut-fallback>Selected Cut</figcaption>
481:         </figure>
482: 
483:         <section class="selected-cut-modal__content">
484:           <p class="selected-cut-modal__eyebrow" data-selected-cut-eyebrow>Selected Cut</p>
485:           <h2 id="selected-cut-modal-title" data-selected-cut-title>Selected Cut</h2>
486:           <p class="selected-cut-modal__category" data-selected-cut-category></p>
487:           <p class="selected-cut-modal__description" data-selected-cut-description></p>
488: 
489:           <div class="selected-cut-modal__note">
490:             <span>Service Note</span>
491:             <p data-selected-cut-service></p>
492:           </div>
493: 
494:           <div class="selected-cut-modal__producer-links-slot" data-selected-cut-producers></div>
495: 
496:           <div class="selected-cut-modal__table-wrap">
497:             <table class="selected-cut-modal__table">
498:               <thead>
499:                 <tr>
500:                   <th scope="col">Code</th>
501:                   <th scope="col">Cut / Product</th>
502:                   <th scope="col">Specification</th>
503:                 </tr>

---- lines 476-504 ----
476: 
477:       <div class="selected-cut-modal__body">
478:         <figure class="selected-cut-modal__media">
479:           <img data-selected-cut-image src="" alt="" loading="lazy" />
480:           <figcaption data-selected-cut-fallback>Selected Cut</figcaption>
481:         </figure>
482: 
483:         <section class="selected-cut-modal__content">
484:           <p class="selected-cut-modal__eyebrow" data-selected-cut-eyebrow>Selected Cut</p>
485:           <h2 id="selected-cut-modal-title" data-selected-cut-title>Selected Cut</h2>
486:           <p class="selected-cut-modal__category" data-selected-cut-category></p>
487:           <p class="selected-cut-modal__description" data-selected-cut-description></p>
488: 
489:           <div class="selected-cut-modal__note">
490:             <span>Service Note</span>
491:             <p data-selected-cut-service></p>
492:           </div>
493: 
494:           <div class="selected-cut-modal__producer-links-slot" data-selected-cut-producers></div>
495: 
496:           <div class="selected-cut-modal__table-wrap">
497:             <table class="selected-cut-modal__table">
498:               <thead>
499:                 <tr>
500:                   <th scope="col">Code</th>
501:                   <th scope="col">Cut / Product</th>
502:                   <th scope="col">Specification</th>
503:                 </tr>
504:               </thead>

---- lines 477-505 ----
477:       <div class="selected-cut-modal__body">
478:         <figure class="selected-cut-modal__media">
479:           <img data-selected-cut-image src="" alt="" loading="lazy" />
480:           <figcaption data-selected-cut-fallback>Selected Cut</figcaption>
481:         </figure>
482: 
483:         <section class="selected-cut-modal__content">
484:           <p class="selected-cut-modal__eyebrow" data-selected-cut-eyebrow>Selected Cut</p>
485:           <h2 id="selected-cut-modal-title" data-selected-cut-title>Selected Cut</h2>
486:           <p class="selected-cut-modal__category" data-selected-cut-category></p>
487:           <p class="selected-cut-modal__description" data-selected-cut-description></p>
488: 
489:           <div class="selected-cut-modal__note">
490:             <span>Service Note</span>
491:             <p data-selected-cut-service></p>
492:           </div>
493: 
494:           <div class="selected-cut-modal__producer-links-slot" data-selected-cut-producers></div>
495: 
496:           <div class="selected-cut-modal__table-wrap">
497:             <table class="selected-cut-modal__table">
498:               <thead>
499:                 <tr>
500:                   <th scope="col">Code</th>
501:                   <th scope="col">Cut / Product</th>
502:                   <th scope="col">Specification</th>
503:                 </tr>
504:               </thead>
505:               <tbody data-selected-cut-rows></tbody>

---- lines 479-507 ----
479:           <img data-selected-cut-image src="" alt="" loading="lazy" />
480:           <figcaption data-selected-cut-fallback>Selected Cut</figcaption>
481:         </figure>
482: 
483:         <section class="selected-cut-modal__content">
484:           <p class="selected-cut-modal__eyebrow" data-selected-cut-eyebrow>Selected Cut</p>
485:           <h2 id="selected-cut-modal-title" data-selected-cut-title>Selected Cut</h2>
486:           <p class="selected-cut-modal__category" data-selected-cut-category></p>
487:           <p class="selected-cut-modal__description" data-selected-cut-description></p>
488: 
489:           <div class="selected-cut-modal__note">
490:             <span>Service Note</span>
491:             <p data-selected-cut-service></p>
492:           </div>
493: 
494:           <div class="selected-cut-modal__producer-links-slot" data-selected-cut-producers></div>
495: 
496:           <div class="selected-cut-modal__table-wrap">
497:             <table class="selected-cut-modal__table">
498:               <thead>
499:                 <tr>
500:                   <th scope="col">Code</th>
501:                   <th scope="col">Cut / Product</th>
502:                   <th scope="col">Specification</th>
503:                 </tr>
504:               </thead>
505:               <tbody data-selected-cut-rows></tbody>
506:             </table>
507:           </div>

---- lines 481-509 ----
481:         </figure>
482: 
483:         <section class="selected-cut-modal__content">
484:           <p class="selected-cut-modal__eyebrow" data-selected-cut-eyebrow>Selected Cut</p>
485:           <h2 id="selected-cut-modal-title" data-selected-cut-title>Selected Cut</h2>
486:           <p class="selected-cut-modal__category" data-selected-cut-category></p>
487:           <p class="selected-cut-modal__description" data-selected-cut-description></p>
488: 
489:           <div class="selected-cut-modal__note">
490:             <span>Service Note</span>
491:             <p data-selected-cut-service></p>
492:           </div>
493: 
494:           <div class="selected-cut-modal__producer-links-slot" data-selected-cut-producers></div>
495: 
496:           <div class="selected-cut-modal__table-wrap">
497:             <table class="selected-cut-modal__table">
498:               <thead>
499:                 <tr>
500:                   <th scope="col">Code</th>
501:                   <th scope="col">Cut / Product</th>
502:                   <th scope="col">Specification</th>
503:                 </tr>
504:               </thead>
505:               <tbody data-selected-cut-rows></tbody>
506:             </table>
507:           </div>
508:         </section>
509:       </div>

---- lines 484-512 ----
484:           <p class="selected-cut-modal__eyebrow" data-selected-cut-eyebrow>Selected Cut</p>
485:           <h2 id="selected-cut-modal-title" data-selected-cut-title>Selected Cut</h2>
486:           <p class="selected-cut-modal__category" data-selected-cut-category></p>
487:           <p class="selected-cut-modal__description" data-selected-cut-description></p>
488: 
489:           <div class="selected-cut-modal__note">
490:             <span>Service Note</span>
491:             <p data-selected-cut-service></p>
492:           </div>
493: 
494:           <div class="selected-cut-modal__producer-links-slot" data-selected-cut-producers></div>
495: 
496:           <div class="selected-cut-modal__table-wrap">
497:             <table class="selected-cut-modal__table">
498:               <thead>
499:                 <tr>
500:                   <th scope="col">Code</th>
501:                   <th scope="col">Cut / Product</th>
502:                   <th scope="col">Specification</th>
503:                 </tr>
504:               </thead>
505:               <tbody data-selected-cut-rows></tbody>
506:             </table>
507:           </div>
508:         </section>
509:       </div>
510:     </div>
511:   `;
512: 

---- lines 486-514 ----
486:           <p class="selected-cut-modal__category" data-selected-cut-category></p>
487:           <p class="selected-cut-modal__description" data-selected-cut-description></p>
488: 
489:           <div class="selected-cut-modal__note">
490:             <span>Service Note</span>
491:             <p data-selected-cut-service></p>
492:           </div>
493: 
494:           <div class="selected-cut-modal__producer-links-slot" data-selected-cut-producers></div>
495: 
496:           <div class="selected-cut-modal__table-wrap">
497:             <table class="selected-cut-modal__table">
498:               <thead>
499:                 <tr>
500:                   <th scope="col">Code</th>
501:                   <th scope="col">Cut / Product</th>
502:                   <th scope="col">Specification</th>
503:                 </tr>
504:               </thead>
505:               <tbody data-selected-cut-rows></tbody>
506:             </table>
507:           </div>
508:         </section>
509:       </div>
510:     </div>
511:   `;
512: 
513:   let lastTrigger = null;
514:   let modal = document.getElementById("selected-cut-modal");

---- lines 487-515 ----
487:           <p class="selected-cut-modal__description" data-selected-cut-description></p>
488: 
489:           <div class="selected-cut-modal__note">
490:             <span>Service Note</span>
491:             <p data-selected-cut-service></p>
492:           </div>
493: 
494:           <div class="selected-cut-modal__producer-links-slot" data-selected-cut-producers></div>
495: 
496:           <div class="selected-cut-modal__table-wrap">
497:             <table class="selected-cut-modal__table">
498:               <thead>
499:                 <tr>
500:                   <th scope="col">Code</th>
501:                   <th scope="col">Cut / Product</th>
502:                   <th scope="col">Specification</th>
503:                 </tr>
504:               </thead>
505:               <tbody data-selected-cut-rows></tbody>
506:             </table>
507:           </div>
508:         </section>
509:       </div>
510:     </div>
511:   `;
512: 
513:   let lastTrigger = null;
514:   let modal = document.getElementById("selected-cut-modal");
515: 

---- lines 495-523 ----
495: 
496:           <div class="selected-cut-modal__table-wrap">
497:             <table class="selected-cut-modal__table">
498:               <thead>
499:                 <tr>
500:                   <th scope="col">Code</th>
501:                   <th scope="col">Cut / Product</th>
502:                   <th scope="col">Specification</th>
503:                 </tr>
504:               </thead>
505:               <tbody data-selected-cut-rows></tbody>
506:             </table>
507:           </div>
508:         </section>
509:       </div>
510:     </div>
511:   `;
512: 
513:   let lastTrigger = null;
514:   let modal = document.getElementById("selected-cut-modal");
515: 
516:   if (!modal) {
517:     modal = document.createElement("dialog");
518:     modal.id = "selected-cut-modal";
519:     document.body.appendChild(modal);
520:   }
521: 
522:   modal.className = "selected-cut-modal";
523:   modal.setAttribute("aria-labelledby", "selected-cut-modal-title");

---- lines 504-532 ----
504:               </thead>
505:               <tbody data-selected-cut-rows></tbody>
506:             </table>
507:           </div>
508:         </section>
509:       </div>
510:     </div>
511:   `;
512: 
513:   let lastTrigger = null;
514:   let modal = document.getElementById("selected-cut-modal");
515: 
516:   if (!modal) {
517:     modal = document.createElement("dialog");
518:     modal.id = "selected-cut-modal";
519:     document.body.appendChild(modal);
520:   }
521: 
522:   modal.className = "selected-cut-modal";
523:   modal.setAttribute("aria-labelledby", "selected-cut-modal-title");
524:   modal.innerHTML = modalContent;
525: 
526:   const panel = modal.querySelector(".selected-cut-modal__panel");
527:   const closeButton = modal.querySelector("[data-selected-cut-close]");
528:   const eyebrowNode = modal.querySelector("[data-selected-cut-eyebrow]");
529:   const titleNode = modal.querySelector("[data-selected-cut-title]");
530:   const categoryNode = modal.querySelector("[data-selected-cut-category]");
531:   const descriptionNode = modal.querySelector("[data-selected-cut-description]");
532:   const serviceNode = modal.querySelector("[data-selected-cut-service]");

---- lines 506-534 ----
506:             </table>
507:           </div>
508:         </section>
509:       </div>
510:     </div>
511:   `;
512: 
513:   let lastTrigger = null;
514:   let modal = document.getElementById("selected-cut-modal");
515: 
516:   if (!modal) {
517:     modal = document.createElement("dialog");
518:     modal.id = "selected-cut-modal";
519:     document.body.appendChild(modal);
520:   }
521: 
522:   modal.className = "selected-cut-modal";
523:   modal.setAttribute("aria-labelledby", "selected-cut-modal-title");
524:   modal.innerHTML = modalContent;
525: 
526:   const panel = modal.querySelector(".selected-cut-modal__panel");
527:   const closeButton = modal.querySelector("[data-selected-cut-close]");
528:   const eyebrowNode = modal.querySelector("[data-selected-cut-eyebrow]");
529:   const titleNode = modal.querySelector("[data-selected-cut-title]");
530:   const categoryNode = modal.querySelector("[data-selected-cut-category]");
531:   const descriptionNode = modal.querySelector("[data-selected-cut-description]");
532:   const serviceNode = modal.querySelector("[data-selected-cut-service]");
533:   const producersNode = modal.querySelector("[data-selected-cut-producers]");
534:   const rowsNode = modal.querySelector("[data-selected-cut-rows]");

---- lines 507-535 ----
507:           </div>
508:         </section>
509:       </div>
510:     </div>
511:   `;
512: 
513:   let lastTrigger = null;
514:   let modal = document.getElementById("selected-cut-modal");
515: 
516:   if (!modal) {
517:     modal = document.createElement("dialog");
518:     modal.id = "selected-cut-modal";
519:     document.body.appendChild(modal);
520:   }
521: 
522:   modal.className = "selected-cut-modal";
523:   modal.setAttribute("aria-labelledby", "selected-cut-modal-title");
524:   modal.innerHTML = modalContent;
525: 
526:   const panel = modal.querySelector(".selected-cut-modal__panel");
527:   const closeButton = modal.querySelector("[data-selected-cut-close]");
528:   const eyebrowNode = modal.querySelector("[data-selected-cut-eyebrow]");
529:   const titleNode = modal.querySelector("[data-selected-cut-title]");
530:   const categoryNode = modal.querySelector("[data-selected-cut-category]");
531:   const descriptionNode = modal.querySelector("[data-selected-cut-description]");
532:   const serviceNode = modal.querySelector("[data-selected-cut-service]");
533:   const producersNode = modal.querySelector("[data-selected-cut-producers]");
534:   const rowsNode = modal.querySelector("[data-selected-cut-rows]");
535:   const imageNode = modal.querySelector("[data-selected-cut-image]");

---- lines 508-536 ----
508:         </section>
509:       </div>
510:     </div>
511:   `;
512: 
513:   let lastTrigger = null;
514:   let modal = document.getElementById("selected-cut-modal");
515: 
516:   if (!modal) {
517:     modal = document.createElement("dialog");
518:     modal.id = "selected-cut-modal";
519:     document.body.appendChild(modal);
520:   }
521: 
522:   modal.className = "selected-cut-modal";
523:   modal.setAttribute("aria-labelledby", "selected-cut-modal-title");
524:   modal.innerHTML = modalContent;
525: 
526:   const panel = modal.querySelector(".selected-cut-modal__panel");
527:   const closeButton = modal.querySelector("[data-selected-cut-close]");
528:   const eyebrowNode = modal.querySelector("[data-selected-cut-eyebrow]");
529:   const titleNode = modal.querySelector("[data-selected-cut-title]");
530:   const categoryNode = modal.querySelector("[data-selected-cut-category]");
531:   const descriptionNode = modal.querySelector("[data-selected-cut-description]");
532:   const serviceNode = modal.querySelector("[data-selected-cut-service]");
533:   const producersNode = modal.querySelector("[data-selected-cut-producers]");
534:   const rowsNode = modal.querySelector("[data-selected-cut-rows]");
535:   const imageNode = modal.querySelector("[data-selected-cut-image]");
536:   const fallbackNode = modal.querySelector("[data-selected-cut-fallback]");

---- lines 509-537 ----
509:       </div>
510:     </div>
511:   `;
512: 
513:   let lastTrigger = null;
514:   let modal = document.getElementById("selected-cut-modal");
515: 
516:   if (!modal) {
517:     modal = document.createElement("dialog");
518:     modal.id = "selected-cut-modal";
519:     document.body.appendChild(modal);
520:   }
521: 
522:   modal.className = "selected-cut-modal";
523:   modal.setAttribute("aria-labelledby", "selected-cut-modal-title");
524:   modal.innerHTML = modalContent;
525: 
526:   const panel = modal.querySelector(".selected-cut-modal__panel");
527:   const closeButton = modal.querySelector("[data-selected-cut-close]");
528:   const eyebrowNode = modal.querySelector("[data-selected-cut-eyebrow]");
529:   const titleNode = modal.querySelector("[data-selected-cut-title]");
530:   const categoryNode = modal.querySelector("[data-selected-cut-category]");
531:   const descriptionNode = modal.querySelector("[data-selected-cut-description]");
532:   const serviceNode = modal.querySelector("[data-selected-cut-service]");
533:   const producersNode = modal.querySelector("[data-selected-cut-producers]");
534:   const rowsNode = modal.querySelector("[data-selected-cut-rows]");
535:   const imageNode = modal.querySelector("[data-selected-cut-image]");
536:   const fallbackNode = modal.querySelector("[data-selected-cut-fallback]");
537: 

---- lines 512-540 ----
512: 
513:   let lastTrigger = null;
514:   let modal = document.getElementById("selected-cut-modal");
515: 
516:   if (!modal) {
517:     modal = document.createElement("dialog");
518:     modal.id = "selected-cut-modal";
519:     document.body.appendChild(modal);
520:   }
521: 
522:   modal.className = "selected-cut-modal";
523:   modal.setAttribute("aria-labelledby", "selected-cut-modal-title");
524:   modal.innerHTML = modalContent;
525: 
526:   const panel = modal.querySelector(".selected-cut-modal__panel");
527:   const closeButton = modal.querySelector("[data-selected-cut-close]");
528:   const eyebrowNode = modal.querySelector("[data-selected-cut-eyebrow]");
529:   const titleNode = modal.querySelector("[data-selected-cut-title]");
530:   const categoryNode = modal.querySelector("[data-selected-cut-category]");
531:   const descriptionNode = modal.querySelector("[data-selected-cut-description]");
532:   const serviceNode = modal.querySelector("[data-selected-cut-service]");
533:   const producersNode = modal.querySelector("[data-selected-cut-producers]");
534:   const rowsNode = modal.querySelector("[data-selected-cut-rows]");
535:   const imageNode = modal.querySelector("[data-selected-cut-image]");
536:   const fallbackNode = modal.querySelector("[data-selected-cut-fallback]");
537: 
538:   const openSelectedCut = (cutName, trigger) => {
539:     const cut = selectedCuts[cutName];
540: 

---- lines 513-541 ----
513:   let lastTrigger = null;
514:   let modal = document.getElementById("selected-cut-modal");
515: 
516:   if (!modal) {
517:     modal = document.createElement("dialog");
518:     modal.id = "selected-cut-modal";
519:     document.body.appendChild(modal);
520:   }
521: 
522:   modal.className = "selected-cut-modal";
523:   modal.setAttribute("aria-labelledby", "selected-cut-modal-title");
524:   modal.innerHTML = modalContent;
525: 
526:   const panel = modal.querySelector(".selected-cut-modal__panel");
527:   const closeButton = modal.querySelector("[data-selected-cut-close]");
528:   const eyebrowNode = modal.querySelector("[data-selected-cut-eyebrow]");
529:   const titleNode = modal.querySelector("[data-selected-cut-title]");
530:   const categoryNode = modal.querySelector("[data-selected-cut-category]");
531:   const descriptionNode = modal.querySelector("[data-selected-cut-description]");
532:   const serviceNode = modal.querySelector("[data-selected-cut-service]");
533:   const producersNode = modal.querySelector("[data-selected-cut-producers]");
534:   const rowsNode = modal.querySelector("[data-selected-cut-rows]");
535:   const imageNode = modal.querySelector("[data-selected-cut-image]");
536:   const fallbackNode = modal.querySelector("[data-selected-cut-fallback]");
537: 
538:   const openSelectedCut = (cutName, trigger) => {
539:     const cut = selectedCuts[cutName];
540: 
541:     if (!cut) {

---- lines 514-542 ----
514:   let modal = document.getElementById("selected-cut-modal");
515: 
516:   if (!modal) {
517:     modal = document.createElement("dialog");
518:     modal.id = "selected-cut-modal";
519:     document.body.appendChild(modal);
520:   }
521: 
522:   modal.className = "selected-cut-modal";
523:   modal.setAttribute("aria-labelledby", "selected-cut-modal-title");
524:   modal.innerHTML = modalContent;
525: 
526:   const panel = modal.querySelector(".selected-cut-modal__panel");
527:   const closeButton = modal.querySelector("[data-selected-cut-close]");
528:   const eyebrowNode = modal.querySelector("[data-selected-cut-eyebrow]");
529:   const titleNode = modal.querySelector("[data-selected-cut-title]");
530:   const categoryNode = modal.querySelector("[data-selected-cut-category]");
531:   const descriptionNode = modal.querySelector("[data-selected-cut-description]");
532:   const serviceNode = modal.querySelector("[data-selected-cut-service]");
533:   const producersNode = modal.querySelector("[data-selected-cut-producers]");
534:   const rowsNode = modal.querySelector("[data-selected-cut-rows]");
535:   const imageNode = modal.querySelector("[data-selected-cut-image]");
536:   const fallbackNode = modal.querySelector("[data-selected-cut-fallback]");
537: 
538:   const openSelectedCut = (cutName, trigger) => {
539:     const cut = selectedCuts[cutName];
540: 
541:     if (!cut) {
542:       return;

---- lines 516-544 ----
516:   if (!modal) {
517:     modal = document.createElement("dialog");
518:     modal.id = "selected-cut-modal";
519:     document.body.appendChild(modal);
520:   }
521: 
522:   modal.className = "selected-cut-modal";
523:   modal.setAttribute("aria-labelledby", "selected-cut-modal-title");
524:   modal.innerHTML = modalContent;
525: 
526:   const panel = modal.querySelector(".selected-cut-modal__panel");
527:   const closeButton = modal.querySelector("[data-selected-cut-close]");
528:   const eyebrowNode = modal.querySelector("[data-selected-cut-eyebrow]");
529:   const titleNode = modal.querySelector("[data-selected-cut-title]");
530:   const categoryNode = modal.querySelector("[data-selected-cut-category]");
531:   const descriptionNode = modal.querySelector("[data-selected-cut-description]");
532:   const serviceNode = modal.querySelector("[data-selected-cut-service]");
533:   const producersNode = modal.querySelector("[data-selected-cut-producers]");
534:   const rowsNode = modal.querySelector("[data-selected-cut-rows]");
535:   const imageNode = modal.querySelector("[data-selected-cut-image]");
536:   const fallbackNode = modal.querySelector("[data-selected-cut-fallback]");
537: 
538:   const openSelectedCut = (cutName, trigger) => {
539:     const cut = selectedCuts[cutName];
540: 
541:     if (!cut) {
542:       return;
543:     }
544: 

---- lines 517-545 ----
517:     modal = document.createElement("dialog");
518:     modal.id = "selected-cut-modal";
519:     document.body.appendChild(modal);
520:   }
521: 
522:   modal.className = "selected-cut-modal";
523:   modal.setAttribute("aria-labelledby", "selected-cut-modal-title");
524:   modal.innerHTML = modalContent;
525: 
526:   const panel = modal.querySelector(".selected-cut-modal__panel");
527:   const closeButton = modal.querySelector("[data-selected-cut-close]");
528:   const eyebrowNode = modal.querySelector("[data-selected-cut-eyebrow]");
529:   const titleNode = modal.querySelector("[data-selected-cut-title]");
530:   const categoryNode = modal.querySelector("[data-selected-cut-category]");
531:   const descriptionNode = modal.querySelector("[data-selected-cut-description]");
532:   const serviceNode = modal.querySelector("[data-selected-cut-service]");
533:   const producersNode = modal.querySelector("[data-selected-cut-producers]");
534:   const rowsNode = modal.querySelector("[data-selected-cut-rows]");
535:   const imageNode = modal.querySelector("[data-selected-cut-image]");
536:   const fallbackNode = modal.querySelector("[data-selected-cut-fallback]");
537: 
538:   const openSelectedCut = (cutName, trigger) => {
539:     const cut = selectedCuts[cutName];
540: 
541:     if (!cut) {
542:       return;
543:     }
544: 
545:     lastTrigger = trigger || null;

---- lines 518-546 ----
518:     modal.id = "selected-cut-modal";
519:     document.body.appendChild(modal);
520:   }
521: 
522:   modal.className = "selected-cut-modal";
523:   modal.setAttribute("aria-labelledby", "selected-cut-modal-title");
524:   modal.innerHTML = modalContent;
525: 
526:   const panel = modal.querySelector(".selected-cut-modal__panel");
527:   const closeButton = modal.querySelector("[data-selected-cut-close]");
528:   const eyebrowNode = modal.querySelector("[data-selected-cut-eyebrow]");
529:   const titleNode = modal.querySelector("[data-selected-cut-title]");
530:   const categoryNode = modal.querySelector("[data-selected-cut-category]");
531:   const descriptionNode = modal.querySelector("[data-selected-cut-description]");
532:   const serviceNode = modal.querySelector("[data-selected-cut-service]");
533:   const producersNode = modal.querySelector("[data-selected-cut-producers]");
534:   const rowsNode = modal.querySelector("[data-selected-cut-rows]");
535:   const imageNode = modal.querySelector("[data-selected-cut-image]");
536:   const fallbackNode = modal.querySelector("[data-selected-cut-fallback]");
537: 
538:   const openSelectedCut = (cutName, trigger) => {
539:     const cut = selectedCuts[cutName];
540: 
541:     if (!cut) {
542:       return;
543:     }
544: 
545:     lastTrigger = trigger || null;
546: 

---- lines 519-547 ----
519:     document.body.appendChild(modal);
520:   }
521: 
522:   modal.className = "selected-cut-modal";
523:   modal.setAttribute("aria-labelledby", "selected-cut-modal-title");
524:   modal.innerHTML = modalContent;
525: 
526:   const panel = modal.querySelector(".selected-cut-modal__panel");
527:   const closeButton = modal.querySelector("[data-selected-cut-close]");
528:   const eyebrowNode = modal.querySelector("[data-selected-cut-eyebrow]");
529:   const titleNode = modal.querySelector("[data-selected-cut-title]");
530:   const categoryNode = modal.querySelector("[data-selected-cut-category]");
531:   const descriptionNode = modal.querySelector("[data-selected-cut-description]");
532:   const serviceNode = modal.querySelector("[data-selected-cut-service]");
533:   const producersNode = modal.querySelector("[data-selected-cut-producers]");
534:   const rowsNode = modal.querySelector("[data-selected-cut-rows]");
535:   const imageNode = modal.querySelector("[data-selected-cut-image]");
536:   const fallbackNode = modal.querySelector("[data-selected-cut-fallback]");
537: 
538:   const openSelectedCut = (cutName, trigger) => {
539:     const cut = selectedCuts[cutName];
540: 
541:     if (!cut) {
542:       return;
543:     }
544: 
545:     lastTrigger = trigger || null;
546: 
547:     eyebrowNode.textContent = cut.eyebrow;

---- lines 520-548 ----
520:   }
521: 
522:   modal.className = "selected-cut-modal";
523:   modal.setAttribute("aria-labelledby", "selected-cut-modal-title");
524:   modal.innerHTML = modalContent;
525: 
526:   const panel = modal.querySelector(".selected-cut-modal__panel");
527:   const closeButton = modal.querySelector("[data-selected-cut-close]");
528:   const eyebrowNode = modal.querySelector("[data-selected-cut-eyebrow]");
529:   const titleNode = modal.querySelector("[data-selected-cut-title]");
530:   const categoryNode = modal.querySelector("[data-selected-cut-category]");
531:   const descriptionNode = modal.querySelector("[data-selected-cut-description]");
532:   const serviceNode = modal.querySelector("[data-selected-cut-service]");
533:   const producersNode = modal.querySelector("[data-selected-cut-producers]");
534:   const rowsNode = modal.querySelector("[data-selected-cut-rows]");
535:   const imageNode = modal.querySelector("[data-selected-cut-image]");
536:   const fallbackNode = modal.querySelector("[data-selected-cut-fallback]");
537: 
538:   const openSelectedCut = (cutName, trigger) => {
539:     const cut = selectedCuts[cutName];
540: 
541:     if (!cut) {
542:       return;
543:     }
544: 
545:     lastTrigger = trigger || null;
546: 
547:     eyebrowNode.textContent = cut.eyebrow;
548:     titleNode.textContent = cut.title;

---- lines 521-549 ----
521: 
522:   modal.className = "selected-cut-modal";
523:   modal.setAttribute("aria-labelledby", "selected-cut-modal-title");
524:   modal.innerHTML = modalContent;
525: 
526:   const panel = modal.querySelector(".selected-cut-modal__panel");
527:   const closeButton = modal.querySelector("[data-selected-cut-close]");
528:   const eyebrowNode = modal.querySelector("[data-selected-cut-eyebrow]");
529:   const titleNode = modal.querySelector("[data-selected-cut-title]");
530:   const categoryNode = modal.querySelector("[data-selected-cut-category]");
531:   const descriptionNode = modal.querySelector("[data-selected-cut-description]");
532:   const serviceNode = modal.querySelector("[data-selected-cut-service]");
533:   const producersNode = modal.querySelector("[data-selected-cut-producers]");
534:   const rowsNode = modal.querySelector("[data-selected-cut-rows]");
535:   const imageNode = modal.querySelector("[data-selected-cut-image]");
536:   const fallbackNode = modal.querySelector("[data-selected-cut-fallback]");
537: 
538:   const openSelectedCut = (cutName, trigger) => {
539:     const cut = selectedCuts[cutName];
540: 
541:     if (!cut) {
542:       return;
543:     }
544: 
545:     lastTrigger = trigger || null;
546: 
547:     eyebrowNode.textContent = cut.eyebrow;
548:     titleNode.textContent = cut.title;
549:     categoryNode.textContent = cut.category;

---- lines 522-550 ----
522:   modal.className = "selected-cut-modal";
523:   modal.setAttribute("aria-labelledby", "selected-cut-modal-title");
524:   modal.innerHTML = modalContent;
525: 
526:   const panel = modal.querySelector(".selected-cut-modal__panel");
527:   const closeButton = modal.querySelector("[data-selected-cut-close]");
528:   const eyebrowNode = modal.querySelector("[data-selected-cut-eyebrow]");
529:   const titleNode = modal.querySelector("[data-selected-cut-title]");
530:   const categoryNode = modal.querySelector("[data-selected-cut-category]");
531:   const descriptionNode = modal.querySelector("[data-selected-cut-description]");
532:   const serviceNode = modal.querySelector("[data-selected-cut-service]");
533:   const producersNode = modal.querySelector("[data-selected-cut-producers]");
534:   const rowsNode = modal.querySelector("[data-selected-cut-rows]");
535:   const imageNode = modal.querySelector("[data-selected-cut-image]");
536:   const fallbackNode = modal.querySelector("[data-selected-cut-fallback]");
537: 
538:   const openSelectedCut = (cutName, trigger) => {
539:     const cut = selectedCuts[cutName];
540: 
541:     if (!cut) {
542:       return;
543:     }
544: 
545:     lastTrigger = trigger || null;
546: 
547:     eyebrowNode.textContent = cut.eyebrow;
548:     titleNode.textContent = cut.title;
549:     categoryNode.textContent = cut.category;
550:     descriptionNode.textContent = cut.description;

---- lines 523-551 ----
523:   modal.setAttribute("aria-labelledby", "selected-cut-modal-title");
524:   modal.innerHTML = modalContent;
525: 
526:   const panel = modal.querySelector(".selected-cut-modal__panel");
527:   const closeButton = modal.querySelector("[data-selected-cut-close]");
528:   const eyebrowNode = modal.querySelector("[data-selected-cut-eyebrow]");
529:   const titleNode = modal.querySelector("[data-selected-cut-title]");
530:   const categoryNode = modal.querySelector("[data-selected-cut-category]");
531:   const descriptionNode = modal.querySelector("[data-selected-cut-description]");
532:   const serviceNode = modal.querySelector("[data-selected-cut-service]");
533:   const producersNode = modal.querySelector("[data-selected-cut-producers]");
534:   const rowsNode = modal.querySelector("[data-selected-cut-rows]");
535:   const imageNode = modal.querySelector("[data-selected-cut-image]");
536:   const fallbackNode = modal.querySelector("[data-selected-cut-fallback]");
537: 
538:   const openSelectedCut = (cutName, trigger) => {
539:     const cut = selectedCuts[cutName];
540: 
541:     if (!cut) {
542:       return;
543:     }
544: 
545:     lastTrigger = trigger || null;
546: 
547:     eyebrowNode.textContent = cut.eyebrow;
548:     titleNode.textContent = cut.title;
549:     categoryNode.textContent = cut.category;
550:     descriptionNode.textContent = cut.description;
551:     serviceNode.textContent = cut.service;

---- lines 524-552 ----
524:   modal.innerHTML = modalContent;
525: 
526:   const panel = modal.querySelector(".selected-cut-modal__panel");
527:   const closeButton = modal.querySelector("[data-selected-cut-close]");
528:   const eyebrowNode = modal.querySelector("[data-selected-cut-eyebrow]");
529:   const titleNode = modal.querySelector("[data-selected-cut-title]");
530:   const categoryNode = modal.querySelector("[data-selected-cut-category]");
531:   const descriptionNode = modal.querySelector("[data-selected-cut-description]");
532:   const serviceNode = modal.querySelector("[data-selected-cut-service]");
533:   const producersNode = modal.querySelector("[data-selected-cut-producers]");
534:   const rowsNode = modal.querySelector("[data-selected-cut-rows]");
535:   const imageNode = modal.querySelector("[data-selected-cut-image]");
536:   const fallbackNode = modal.querySelector("[data-selected-cut-fallback]");
537: 
538:   const openSelectedCut = (cutName, trigger) => {
539:     const cut = selectedCuts[cutName];
540: 
541:     if (!cut) {
542:       return;
543:     }
544: 
545:     lastTrigger = trigger || null;
546: 
547:     eyebrowNode.textContent = cut.eyebrow;
548:     titleNode.textContent = cut.title;
549:     categoryNode.textContent = cut.category;
550:     descriptionNode.textContent = cut.description;
551:     serviceNode.textContent = cut.service;
552: 

---- lines 525-553 ----
525: 
526:   const panel = modal.querySelector(".selected-cut-modal__panel");
527:   const closeButton = modal.querySelector("[data-selected-cut-close]");
528:   const eyebrowNode = modal.querySelector("[data-selected-cut-eyebrow]");
529:   const titleNode = modal.querySelector("[data-selected-cut-title]");
530:   const categoryNode = modal.querySelector("[data-selected-cut-category]");
531:   const descriptionNode = modal.querySelector("[data-selected-cut-description]");
532:   const serviceNode = modal.querySelector("[data-selected-cut-service]");
533:   const producersNode = modal.querySelector("[data-selected-cut-producers]");
534:   const rowsNode = modal.querySelector("[data-selected-cut-rows]");
535:   const imageNode = modal.querySelector("[data-selected-cut-image]");
536:   const fallbackNode = modal.querySelector("[data-selected-cut-fallback]");
537: 
538:   const openSelectedCut = (cutName, trigger) => {
539:     const cut = selectedCuts[cutName];
540: 
541:     if (!cut) {
542:       return;
543:     }
544: 
545:     lastTrigger = trigger || null;
546: 
547:     eyebrowNode.textContent = cut.eyebrow;
548:     titleNode.textContent = cut.title;
549:     categoryNode.textContent = cut.category;
550:     descriptionNode.textContent = cut.description;
551:     serviceNode.textContent = cut.service;
552: 
553:     if (producersNode) {

---- lines 526-554 ----
526:   const panel = modal.querySelector(".selected-cut-modal__panel");
527:   const closeButton = modal.querySelector("[data-selected-cut-close]");
528:   const eyebrowNode = modal.querySelector("[data-selected-cut-eyebrow]");
529:   const titleNode = modal.querySelector("[data-selected-cut-title]");
530:   const categoryNode = modal.querySelector("[data-selected-cut-category]");
531:   const descriptionNode = modal.querySelector("[data-selected-cut-description]");
532:   const serviceNode = modal.querySelector("[data-selected-cut-service]");
533:   const producersNode = modal.querySelector("[data-selected-cut-producers]");
534:   const rowsNode = modal.querySelector("[data-selected-cut-rows]");
535:   const imageNode = modal.querySelector("[data-selected-cut-image]");
536:   const fallbackNode = modal.querySelector("[data-selected-cut-fallback]");
537: 
538:   const openSelectedCut = (cutName, trigger) => {
539:     const cut = selectedCuts[cutName];
540: 
541:     if (!cut) {
542:       return;
543:     }
544: 
545:     lastTrigger = trigger || null;
546: 
547:     eyebrowNode.textContent = cut.eyebrow;
548:     titleNode.textContent = cut.title;
549:     categoryNode.textContent = cut.category;
550:     descriptionNode.textContent = cut.description;
551:     serviceNode.textContent = cut.service;
552: 
553:     if (producersNode) {
554:       producersNode.innerHTML = createProducerProgramLinks(cutName);

---- lines 528-556 ----
528:   const eyebrowNode = modal.querySelector("[data-selected-cut-eyebrow]");
529:   const titleNode = modal.querySelector("[data-selected-cut-title]");
530:   const categoryNode = modal.querySelector("[data-selected-cut-category]");
531:   const descriptionNode = modal.querySelector("[data-selected-cut-description]");
532:   const serviceNode = modal.querySelector("[data-selected-cut-service]");
533:   const producersNode = modal.querySelector("[data-selected-cut-producers]");
534:   const rowsNode = modal.querySelector("[data-selected-cut-rows]");
535:   const imageNode = modal.querySelector("[data-selected-cut-image]");
536:   const fallbackNode = modal.querySelector("[data-selected-cut-fallback]");
537: 
538:   const openSelectedCut = (cutName, trigger) => {
539:     const cut = selectedCuts[cutName];
540: 
541:     if (!cut) {
542:       return;
543:     }
544: 
545:     lastTrigger = trigger || null;
546: 
547:     eyebrowNode.textContent = cut.eyebrow;
548:     titleNode.textContent = cut.title;
549:     categoryNode.textContent = cut.category;
550:     descriptionNode.textContent = cut.description;
551:     serviceNode.textContent = cut.service;
552: 
553:     if (producersNode) {
554:       producersNode.innerHTML = createProducerProgramLinks(cutName);
555:     }
556:     rowsNode.innerHTML = createRows(cut.rows);

---- lines 529-557 ----
529:   const titleNode = modal.querySelector("[data-selected-cut-title]");
530:   const categoryNode = modal.querySelector("[data-selected-cut-category]");
531:   const descriptionNode = modal.querySelector("[data-selected-cut-description]");
532:   const serviceNode = modal.querySelector("[data-selected-cut-service]");
533:   const producersNode = modal.querySelector("[data-selected-cut-producers]");
534:   const rowsNode = modal.querySelector("[data-selected-cut-rows]");
535:   const imageNode = modal.querySelector("[data-selected-cut-image]");
536:   const fallbackNode = modal.querySelector("[data-selected-cut-fallback]");
537: 
538:   const openSelectedCut = (cutName, trigger) => {
539:     const cut = selectedCuts[cutName];
540: 
541:     if (!cut) {
542:       return;
543:     }
544: 
545:     lastTrigger = trigger || null;
546: 
547:     eyebrowNode.textContent = cut.eyebrow;
548:     titleNode.textContent = cut.title;
549:     categoryNode.textContent = cut.category;
550:     descriptionNode.textContent = cut.description;
551:     serviceNode.textContent = cut.service;
552: 
553:     if (producersNode) {
554:       producersNode.innerHTML = createProducerProgramLinks(cutName);
555:     }
556:     rowsNode.innerHTML = createRows(cut.rows);
557:     fallbackNode.textContent = cut.title;

---- lines 544-572 ----
544: 
545:     lastTrigger = trigger || null;
546: 
547:     eyebrowNode.textContent = cut.eyebrow;
548:     titleNode.textContent = cut.title;
549:     categoryNode.textContent = cut.category;
550:     descriptionNode.textContent = cut.description;
551:     serviceNode.textContent = cut.service;
552: 
553:     if (producersNode) {
554:       producersNode.innerHTML = createProducerProgramLinks(cutName);
555:     }
556:     rowsNode.innerHTML = createRows(cut.rows);
557:     fallbackNode.textContent = cut.title;
558: 
559:     imageNode.hidden = false;
560:     fallbackNode.hidden = true;
561:     imageNode.alt = "";
562:     imageNode.src = cut.image;
563: 
564:     imageNode.onerror = () => {
565:       imageNode.hidden = true;
566:       fallbackNode.hidden = false;
567:     };
568: 
569:     document.body.classList.add("selected-cut-modal-open");
570: 
571:     if (typeof modal.showModal === "function" && !modal.open) {
572:       modal.showModal();

---- lines 546-574 ----
546: 
547:     eyebrowNode.textContent = cut.eyebrow;
548:     titleNode.textContent = cut.title;
549:     categoryNode.textContent = cut.category;
550:     descriptionNode.textContent = cut.description;
551:     serviceNode.textContent = cut.service;
552: 
553:     if (producersNode) {
554:       producersNode.innerHTML = createProducerProgramLinks(cutName);
555:     }
556:     rowsNode.innerHTML = createRows(cut.rows);
557:     fallbackNode.textContent = cut.title;
558: 
559:     imageNode.hidden = false;
560:     fallbackNode.hidden = true;
561:     imageNode.alt = "";
562:     imageNode.src = cut.image;
563: 
564:     imageNode.onerror = () => {
565:       imageNode.hidden = true;
566:       fallbackNode.hidden = false;
567:     };
568: 
569:     document.body.classList.add("selected-cut-modal-open");
570: 
571:     if (typeof modal.showModal === "function" && !modal.open) {
572:       modal.showModal();
573:       return;
574:     }

---- lines 559-587 ----
559:     imageNode.hidden = false;
560:     fallbackNode.hidden = true;
561:     imageNode.alt = "";
562:     imageNode.src = cut.image;
563: 
564:     imageNode.onerror = () => {
565:       imageNode.hidden = true;
566:       fallbackNode.hidden = false;
567:     };
568: 
569:     document.body.classList.add("selected-cut-modal-open");
570: 
571:     if (typeof modal.showModal === "function" && !modal.open) {
572:       modal.showModal();
573:       return;
574:     }
575: 
576:     modal.setAttribute("open", "");
577:   };
578: 
579:   window.PARAGON_SELECTED_CUTS = {
580:     open: (cutName) => openSelectedCut(cutName, null),
581:     has: (cutName) => Boolean(selectedCuts[cutName]),
582:   };
583: 
584:   window.addEventListener("paragon:open-selected-cut", (event) => {
585:     const cutName = event.detail?.cutName || event.detail?.title;
586: 
587:     if (cutName) {

---- lines 561-589 ----
561:     imageNode.alt = "";
562:     imageNode.src = cut.image;
563: 
564:     imageNode.onerror = () => {
565:       imageNode.hidden = true;
566:       fallbackNode.hidden = false;
567:     };
568: 
569:     document.body.classList.add("selected-cut-modal-open");
570: 
571:     if (typeof modal.showModal === "function" && !modal.open) {
572:       modal.showModal();
573:       return;
574:     }
575: 
576:     modal.setAttribute("open", "");
577:   };
578: 
579:   window.PARAGON_SELECTED_CUTS = {
580:     open: (cutName) => openSelectedCut(cutName, null),
581:     has: (cutName) => Boolean(selectedCuts[cutName]),
582:   };
583: 
584:   window.addEventListener("paragon:open-selected-cut", (event) => {
585:     const cutName = event.detail?.cutName || event.detail?.title;
586: 
587:     if (cutName) {
588:       openSelectedCut(cutName, null);
589:     }

---- lines 562-590 ----
562:     imageNode.src = cut.image;
563: 
564:     imageNode.onerror = () => {
565:       imageNode.hidden = true;
566:       fallbackNode.hidden = false;
567:     };
568: 
569:     document.body.classList.add("selected-cut-modal-open");
570: 
571:     if (typeof modal.showModal === "function" && !modal.open) {
572:       modal.showModal();
573:       return;
574:     }
575: 
576:     modal.setAttribute("open", "");
577:   };
578: 
579:   window.PARAGON_SELECTED_CUTS = {
580:     open: (cutName) => openSelectedCut(cutName, null),
581:     has: (cutName) => Boolean(selectedCuts[cutName]),
582:   };
583: 
584:   window.addEventListener("paragon:open-selected-cut", (event) => {
585:     const cutName = event.detail?.cutName || event.detail?.title;
586: 
587:     if (cutName) {
588:       openSelectedCut(cutName, null);
589:     }
590:   });

---- lines 566-594 ----
566:       fallbackNode.hidden = false;
567:     };
568: 
569:     document.body.classList.add("selected-cut-modal-open");
570: 
571:     if (typeof modal.showModal === "function" && !modal.open) {
572:       modal.showModal();
573:       return;
574:     }
575: 
576:     modal.setAttribute("open", "");
577:   };
578: 
579:   window.PARAGON_SELECTED_CUTS = {
580:     open: (cutName) => openSelectedCut(cutName, null),
581:     has: (cutName) => Boolean(selectedCuts[cutName]),
582:   };
583: 
584:   window.addEventListener("paragon:open-selected-cut", (event) => {
585:     const cutName = event.detail?.cutName || event.detail?.title;
586: 
587:     if (cutName) {
588:       openSelectedCut(cutName, null);
589:     }
590:   });
591:   const closeSelectedCut = () => {
592:     document.body.classList.remove("selected-cut-modal-open");
593: 
594:     if (typeof modal.close === "function" && modal.open) {

---- lines 569-597 ----
569:     document.body.classList.add("selected-cut-modal-open");
570: 
571:     if (typeof modal.showModal === "function" && !modal.open) {
572:       modal.showModal();
573:       return;
574:     }
575: 
576:     modal.setAttribute("open", "");
577:   };
578: 
579:   window.PARAGON_SELECTED_CUTS = {
580:     open: (cutName) => openSelectedCut(cutName, null),
581:     has: (cutName) => Boolean(selectedCuts[cutName]),
582:   };
583: 
584:   window.addEventListener("paragon:open-selected-cut", (event) => {
585:     const cutName = event.detail?.cutName || event.detail?.title;
586: 
587:     if (cutName) {
588:       openSelectedCut(cutName, null);
589:     }
590:   });
591:   const closeSelectedCut = () => {
592:     document.body.classList.remove("selected-cut-modal-open");
593: 
594:     if (typeof modal.close === "function" && modal.open) {
595:       modal.close();
596:     } else {
597:       modal.removeAttribute("open");

---- lines 570-598 ----
570: 
571:     if (typeof modal.showModal === "function" && !modal.open) {
572:       modal.showModal();
573:       return;
574:     }
575: 
576:     modal.setAttribute("open", "");
577:   };
578: 
579:   window.PARAGON_SELECTED_CUTS = {
580:     open: (cutName) => openSelectedCut(cutName, null),
581:     has: (cutName) => Boolean(selectedCuts[cutName]),
582:   };
583: 
584:   window.addEventListener("paragon:open-selected-cut", (event) => {
585:     const cutName = event.detail?.cutName || event.detail?.title;
586: 
587:     if (cutName) {
588:       openSelectedCut(cutName, null);
589:     }
590:   });
591:   const closeSelectedCut = () => {
592:     document.body.classList.remove("selected-cut-modal-open");
593: 
594:     if (typeof modal.close === "function" && modal.open) {
595:       modal.close();
596:     } else {
597:       modal.removeAttribute("open");
598:     }

---- lines 571-599 ----
571:     if (typeof modal.showModal === "function" && !modal.open) {
572:       modal.showModal();
573:       return;
574:     }
575: 
576:     modal.setAttribute("open", "");
577:   };
578: 
579:   window.PARAGON_SELECTED_CUTS = {
580:     open: (cutName) => openSelectedCut(cutName, null),
581:     has: (cutName) => Boolean(selectedCuts[cutName]),
582:   };
583: 
584:   window.addEventListener("paragon:open-selected-cut", (event) => {
585:     const cutName = event.detail?.cutName || event.detail?.title;
586: 
587:     if (cutName) {
588:       openSelectedCut(cutName, null);
589:     }
590:   });
591:   const closeSelectedCut = () => {
592:     document.body.classList.remove("selected-cut-modal-open");
593: 
594:     if (typeof modal.close === "function" && modal.open) {
595:       modal.close();
596:     } else {
597:       modal.removeAttribute("open");
598:     }
599: 

---- lines 574-602 ----
574:     }
575: 
576:     modal.setAttribute("open", "");
577:   };
578: 
579:   window.PARAGON_SELECTED_CUTS = {
580:     open: (cutName) => openSelectedCut(cutName, null),
581:     has: (cutName) => Boolean(selectedCuts[cutName]),
582:   };
583: 
584:   window.addEventListener("paragon:open-selected-cut", (event) => {
585:     const cutName = event.detail?.cutName || event.detail?.title;
586: 
587:     if (cutName) {
588:       openSelectedCut(cutName, null);
589:     }
590:   });
591:   const closeSelectedCut = () => {
592:     document.body.classList.remove("selected-cut-modal-open");
593: 
594:     if (typeof modal.close === "function" && modal.open) {
595:       modal.close();
596:     } else {
597:       modal.removeAttribute("open");
598:     }
599: 
600:     rowsNode.innerHTML = "";
601:     imageNode.removeAttribute("src");
602: 

---- lines 578-606 ----
578: 
579:   window.PARAGON_SELECTED_CUTS = {
580:     open: (cutName) => openSelectedCut(cutName, null),
581:     has: (cutName) => Boolean(selectedCuts[cutName]),
582:   };
583: 
584:   window.addEventListener("paragon:open-selected-cut", (event) => {
585:     const cutName = event.detail?.cutName || event.detail?.title;
586: 
587:     if (cutName) {
588:       openSelectedCut(cutName, null);
589:     }
590:   });
591:   const closeSelectedCut = () => {
592:     document.body.classList.remove("selected-cut-modal-open");
593: 
594:     if (typeof modal.close === "function" && modal.open) {
595:       modal.close();
596:     } else {
597:       modal.removeAttribute("open");
598:     }
599: 
600:     rowsNode.innerHTML = "";
601:     imageNode.removeAttribute("src");
602: 
603:     if (lastTrigger && typeof lastTrigger.focus === "function") {
604:       lastTrigger.focus({ preventScroll: true });
605:     }
606:   };

---- lines 582-610 ----
582:   };
583: 
584:   window.addEventListener("paragon:open-selected-cut", (event) => {
585:     const cutName = event.detail?.cutName || event.detail?.title;
586: 
587:     if (cutName) {
588:       openSelectedCut(cutName, null);
589:     }
590:   });
591:   const closeSelectedCut = () => {
592:     document.body.classList.remove("selected-cut-modal-open");
593: 
594:     if (typeof modal.close === "function" && modal.open) {
595:       modal.close();
596:     } else {
597:       modal.removeAttribute("open");
598:     }
599: 
600:     rowsNode.innerHTML = "";
601:     imageNode.removeAttribute("src");
602: 
603:     if (lastTrigger && typeof lastTrigger.focus === "function") {
604:       lastTrigger.focus({ preventScroll: true });
605:     }
606:   };
607: 
608:   document.querySelectorAll(".cut-card").forEach((card) => {
609:     const title = card.dataset.selectedCutTrigger || card.querySelector("h3")?.textContent?.trim();
610: 

---- lines 584-612 ----
584:   window.addEventListener("paragon:open-selected-cut", (event) => {
585:     const cutName = event.detail?.cutName || event.detail?.title;
586: 
587:     if (cutName) {
588:       openSelectedCut(cutName, null);
589:     }
590:   });
591:   const closeSelectedCut = () => {
592:     document.body.classList.remove("selected-cut-modal-open");
593: 
594:     if (typeof modal.close === "function" && modal.open) {
595:       modal.close();
596:     } else {
597:       modal.removeAttribute("open");
598:     }
599: 
600:     rowsNode.innerHTML = "";
601:     imageNode.removeAttribute("src");
602: 
603:     if (lastTrigger && typeof lastTrigger.focus === "function") {
604:       lastTrigger.focus({ preventScroll: true });
605:     }
606:   };
607: 
608:   document.querySelectorAll(".cut-card").forEach((card) => {
609:     const title = card.dataset.selectedCutTrigger || card.querySelector("h3")?.textContent?.trim();
610: 
611:     if (!title || !selectedCuts[title]) {
612:       return;

---- lines 585-613 ----
585:     const cutName = event.detail?.cutName || event.detail?.title;
586: 
587:     if (cutName) {
588:       openSelectedCut(cutName, null);
589:     }
590:   });
591:   const closeSelectedCut = () => {
592:     document.body.classList.remove("selected-cut-modal-open");
593: 
594:     if (typeof modal.close === "function" && modal.open) {
595:       modal.close();
596:     } else {
597:       modal.removeAttribute("open");
598:     }
599: 
600:     rowsNode.innerHTML = "";
601:     imageNode.removeAttribute("src");
602: 
603:     if (lastTrigger && typeof lastTrigger.focus === "function") {
604:       lastTrigger.focus({ preventScroll: true });
605:     }
606:   };
607: 
608:   document.querySelectorAll(".cut-card").forEach((card) => {
609:     const title = card.dataset.selectedCutTrigger || card.querySelector("h3")?.textContent?.trim();
610: 
611:     if (!title || !selectedCuts[title]) {
612:       return;
613:     }

---- lines 587-615 ----
587:     if (cutName) {
588:       openSelectedCut(cutName, null);
589:     }
590:   });
591:   const closeSelectedCut = () => {
592:     document.body.classList.remove("selected-cut-modal-open");
593: 
594:     if (typeof modal.close === "function" && modal.open) {
595:       modal.close();
596:     } else {
597:       modal.removeAttribute("open");
598:     }
599: 
600:     rowsNode.innerHTML = "";
601:     imageNode.removeAttribute("src");
602: 
603:     if (lastTrigger && typeof lastTrigger.focus === "function") {
604:       lastTrigger.focus({ preventScroll: true });
605:     }
606:   };
607: 
608:   document.querySelectorAll(".cut-card").forEach((card) => {
609:     const title = card.dataset.selectedCutTrigger || card.querySelector("h3")?.textContent?.trim();
610: 
611:     if (!title || !selectedCuts[title]) {
612:       return;
613:     }
614: 
615:     card.dataset.selectedCutTrigger = title;

---- lines 590-618 ----
590:   });
591:   const closeSelectedCut = () => {
592:     document.body.classList.remove("selected-cut-modal-open");
593: 
594:     if (typeof modal.close === "function" && modal.open) {
595:       modal.close();
596:     } else {
597:       modal.removeAttribute("open");
598:     }
599: 
600:     rowsNode.innerHTML = "";
601:     imageNode.removeAttribute("src");
602: 
603:     if (lastTrigger && typeof lastTrigger.focus === "function") {
604:       lastTrigger.focus({ preventScroll: true });
605:     }
606:   };
607: 
608:   document.querySelectorAll(".cut-card").forEach((card) => {
609:     const title = card.dataset.selectedCutTrigger || card.querySelector("h3")?.textContent?.trim();
610: 
611:     if (!title || !selectedCuts[title]) {
612:       return;
613:     }
614: 
615:     card.dataset.selectedCutTrigger = title;
616:     card.setAttribute("role", "button");
617:     card.setAttribute("tabindex", "0");
618:     const cutLabel = selectedCuts[title].title || title;

---- lines 601-629 ----
601:     imageNode.removeAttribute("src");
602: 
603:     if (lastTrigger && typeof lastTrigger.focus === "function") {
604:       lastTrigger.focus({ preventScroll: true });
605:     }
606:   };
607: 
608:   document.querySelectorAll(".cut-card").forEach((card) => {
609:     const title = card.dataset.selectedCutTrigger || card.querySelector("h3")?.textContent?.trim();
610: 
611:     if (!title || !selectedCuts[title]) {
612:       return;
613:     }
614: 
615:     card.dataset.selectedCutTrigger = title;
616:     card.setAttribute("role", "button");
617:     card.setAttribute("tabindex", "0");
618:     const cutLabel = selectedCuts[title].title || title;
619:     card.setAttribute("aria-label", `Open ${cutLabel} details`);
620: 
621:     card.addEventListener("click", () => {
622:       openSelectedCut(title, card);
623:     });
624: 
625:     card.addEventListener("keydown", (event) => {
626:       if (event.key === "Enter" || event.key === " ") {
627:         event.preventDefault();
628:         openSelectedCut(title, card);
629:       }

---- lines 608-636 ----
608:   document.querySelectorAll(".cut-card").forEach((card) => {
609:     const title = card.dataset.selectedCutTrigger || card.querySelector("h3")?.textContent?.trim();
610: 
611:     if (!title || !selectedCuts[title]) {
612:       return;
613:     }
614: 
615:     card.dataset.selectedCutTrigger = title;
616:     card.setAttribute("role", "button");
617:     card.setAttribute("tabindex", "0");
618:     const cutLabel = selectedCuts[title].title || title;
619:     card.setAttribute("aria-label", `Open ${cutLabel} details`);
620: 
621:     card.addEventListener("click", () => {
622:       openSelectedCut(title, card);
623:     });
624: 
625:     card.addEventListener("keydown", (event) => {
626:       if (event.key === "Enter" || event.key === " ") {
627:         event.preventDefault();
628:         openSelectedCut(title, card);
629:       }
630:     });
631:   });
632: 
633:   // CONNECTED_CATALOG_CUT_TO_PRODUCER_EVENTS_START
634:   modal.addEventListener(
635:     "click",
636:     (event) => {

---- lines 609-637 ----
609:     const title = card.dataset.selectedCutTrigger || card.querySelector("h3")?.textContent?.trim();
610: 
611:     if (!title || !selectedCuts[title]) {
612:       return;
613:     }
614: 
615:     card.dataset.selectedCutTrigger = title;
616:     card.setAttribute("role", "button");
617:     card.setAttribute("tabindex", "0");
618:     const cutLabel = selectedCuts[title].title || title;
619:     card.setAttribute("aria-label", `Open ${cutLabel} details`);
620: 
621:     card.addEventListener("click", () => {
622:       openSelectedCut(title, card);
623:     });
624: 
625:     card.addEventListener("keydown", (event) => {
626:       if (event.key === "Enter" || event.key === " ") {
627:         event.preventDefault();
628:         openSelectedCut(title, card);
629:       }
630:     });
631:   });
632: 
633:   // CONNECTED_CATALOG_CUT_TO_PRODUCER_EVENTS_START
634:   modal.addEventListener(
635:     "click",
636:     (event) => {
637:       const producerButton = event.target.closest("[data-connected-producer-trigger]");

---- lines 612-640 ----
612:       return;
613:     }
614: 
615:     card.dataset.selectedCutTrigger = title;
616:     card.setAttribute("role", "button");
617:     card.setAttribute("tabindex", "0");
618:     const cutLabel = selectedCuts[title].title || title;
619:     card.setAttribute("aria-label", `Open ${cutLabel} details`);
620: 
621:     card.addEventListener("click", () => {
622:       openSelectedCut(title, card);
623:     });
624: 
625:     card.addEventListener("keydown", (event) => {
626:       if (event.key === "Enter" || event.key === " ") {
627:         event.preventDefault();
628:         openSelectedCut(title, card);
629:       }
630:     });
631:   });
632: 
633:   // CONNECTED_CATALOG_CUT_TO_PRODUCER_EVENTS_START
634:   modal.addEventListener(
635:     "click",
636:     (event) => {
637:       const producerButton = event.target.closest("[data-connected-producer-trigger]");
638: 
639:       if (!producerButton) {
640:         return;

---- lines 618-646 ----
618:     const cutLabel = selectedCuts[title].title || title;
619:     card.setAttribute("aria-label", `Open ${cutLabel} details`);
620: 
621:     card.addEventListener("click", () => {
622:       openSelectedCut(title, card);
623:     });
624: 
625:     card.addEventListener("keydown", (event) => {
626:       if (event.key === "Enter" || event.key === " ") {
627:         event.preventDefault();
628:         openSelectedCut(title, card);
629:       }
630:     });
631:   });
632: 
633:   // CONNECTED_CATALOG_CUT_TO_PRODUCER_EVENTS_START
634:   modal.addEventListener(
635:     "click",
636:     (event) => {
637:       const producerButton = event.target.closest("[data-connected-producer-trigger]");
638: 
639:       if (!producerButton) {
640:         return;
641:       }
642: 
643:       event.preventDefault();
644:       event.stopPropagation();
645: 
646:       const productListTitle = producerButton.dataset.connectedProducerTrigger;

---- lines 624-652 ----
624: 
625:     card.addEventListener("keydown", (event) => {
626:       if (event.key === "Enter" || event.key === " ") {
627:         event.preventDefault();
628:         openSelectedCut(title, card);
629:       }
630:     });
631:   });
632: 
633:   // CONNECTED_CATALOG_CUT_TO_PRODUCER_EVENTS_START
634:   modal.addEventListener(
635:     "click",
636:     (event) => {
637:       const producerButton = event.target.closest("[data-connected-producer-trigger]");
638: 
639:       if (!producerButton) {
640:         return;
641:       }
642: 
643:       event.preventDefault();
644:       event.stopPropagation();
645: 
646:       const productListTitle = producerButton.dataset.connectedProducerTrigger;
647: 
648:       if (!productListTitle) {
649:         return;
650:       }
651: 
652:       closeSelectedCut();

---- lines 646-674 ----
646:       const productListTitle = producerButton.dataset.connectedProducerTrigger;
647: 
648:       if (!productListTitle) {
649:         return;
650:       }
651: 
652:       closeSelectedCut();
653: 
654:       window.setTimeout(() => {
655:         window.dispatchEvent(
656:           new CustomEvent("paragon:open-producer", {
657:             detail: { productListTitle },
658:           }),
659:         );
660:       }, 140);
661:     },
662:     true,
663:   );
664:   // CONNECTED_CATALOG_CUT_TO_PRODUCER_EVENTS_END
665:   closeButton?.addEventListener("click", closeSelectedCut);
666: 
667:   modal.addEventListener("click", (event) => {
668:     if (panel && !panel.contains(event.target)) {
669:       closeSelectedCut();
670:     }
671:   });
672: 
673:   modal.addEventListener("close", () => {
674:     document.body.classList.remove("selected-cut-modal-open");

---- lines 657-684 ----
657:             detail: { productListTitle },
658:           }),
659:         );
660:       }, 140);
661:     },
662:     true,
663:   );
664:   // CONNECTED_CATALOG_CUT_TO_PRODUCER_EVENTS_END
665:   closeButton?.addEventListener("click", closeSelectedCut);
666: 
667:   modal.addEventListener("click", (event) => {
668:     if (panel && !panel.contains(event.target)) {
669:       closeSelectedCut();
670:     }
671:   });
672: 
673:   modal.addEventListener("close", () => {
674:     document.body.classList.remove("selected-cut-modal-open");
675:     rowsNode.innerHTML = "";
676:     imageNode.removeAttribute("src");
677:   });
678: 
679:   document.addEventListener("keydown", (event) => {
680:     if (event.key === "Escape" && modal.open) {
681:       closeSelectedCut();
682:     }
683:   });
684: }

---- lines 663-684 ----
663:   );
664:   // CONNECTED_CATALOG_CUT_TO_PRODUCER_EVENTS_END
665:   closeButton?.addEventListener("click", closeSelectedCut);
666: 
667:   modal.addEventListener("click", (event) => {
668:     if (panel && !panel.contains(event.target)) {
669:       closeSelectedCut();
670:     }
671:   });
672: 
673:   modal.addEventListener("close", () => {
674:     document.body.classList.remove("selected-cut-modal-open");
675:     rowsNode.innerHTML = "";
676:     imageNode.removeAttribute("src");
677:   });
678: 
679:   document.addEventListener("keydown", (event) => {
680:     if (event.key === "Escape" && modal.open) {
681:       closeSelectedCut();
682:     }
683:   });
684: }

---- lines 664-684 ----
664:   // CONNECTED_CATALOG_CUT_TO_PRODUCER_EVENTS_END
665:   closeButton?.addEventListener("click", closeSelectedCut);
666: 
667:   modal.addEventListener("click", (event) => {
668:     if (panel && !panel.contains(event.target)) {
669:       closeSelectedCut();
670:     }
671:   });
672: 
673:   modal.addEventListener("close", () => {
674:     document.body.classList.remove("selected-cut-modal-open");
675:     rowsNode.innerHTML = "";
676:     imageNode.removeAttribute("src");
677:   });
678: 
679:   document.addEventListener("keydown", (event) => {
680:     if (event.key === "Escape" && modal.open) {
681:       closeSelectedCut();
682:     }
683:   });
684: }

---- lines 665-684 ----
665:   closeButton?.addEventListener("click", closeSelectedCut);
666: 
667:   modal.addEventListener("click", (event) => {
668:     if (panel && !panel.contains(event.target)) {
669:       closeSelectedCut();
670:     }
671:   });
672: 
673:   modal.addEventListener("close", () => {
674:     document.body.classList.remove("selected-cut-modal-open");
675:     rowsNode.innerHTML = "";
676:     imageNode.removeAttribute("src");
677:   });
678: 
679:   document.addEventListener("keydown", (event) => {
680:     if (event.key === "Escape" && modal.open) {
681:       closeSelectedCut();
682:     }
683:   });
684: }

---- lines 670-684 ----
670:     }
671:   });
672: 
673:   modal.addEventListener("close", () => {
674:     document.body.classList.remove("selected-cut-modal-open");
675:     rowsNode.innerHTML = "";
676:     imageNode.removeAttribute("src");
677:   });
678: 
679:   document.addEventListener("keydown", (event) => {
680:     if (event.key === "Escape" && modal.open) {
681:       closeSelectedCut();
682:     }
683:   });
684: }

```

## src/main.js Section 4 Card Context

```text
---- lines 252-264 ----
252:           <!-- SECTION_4_CUT_SCROLL_START -->
253: 
254:                     <div class="cut-scroll" aria-label="Selected cuts catalog">
255: 
256:           <article class="cut-card cut-card--all-cuts" data-cut-id="all-cuts" data-product-list-trigger="All Cuts">
257:             <span class="cut-card-shade" aria-hidden="true"></span>
258:             <h3>All Cuts</h3>
259:             <p class="cut-card-description">View the complete visual cut reference.</p>
260:           </article>
261: 
262:           <article class="cut-card cut-card--ribeye" data-cut-id="ribeye" data-selected-cut-trigger="Ribeye">
263:             <img
264:               class="cut-card-image"

---- lines 253-265 ----
253: 
254:                     <div class="cut-scroll" aria-label="Selected cuts catalog">
255: 
256:           <article class="cut-card cut-card--all-cuts" data-cut-id="all-cuts" data-product-list-trigger="All Cuts">
257:             <span class="cut-card-shade" aria-hidden="true"></span>
258:             <h3>All Cuts</h3>
259:             <p class="cut-card-description">View the complete visual cut reference.</p>
260:           </article>
261: 
262:           <article class="cut-card cut-card--ribeye" data-cut-id="ribeye" data-selected-cut-trigger="Ribeye">
263:             <img
264:               class="cut-card-image"
265:               src="${assetPath("assets/cuts/ribeye.png")}"

---- lines 255-267 ----
255: 
256:           <article class="cut-card cut-card--all-cuts" data-cut-id="all-cuts" data-product-list-trigger="All Cuts">
257:             <span class="cut-card-shade" aria-hidden="true"></span>
258:             <h3>All Cuts</h3>
259:             <p class="cut-card-description">View the complete visual cut reference.</p>
260:           </article>
261: 
262:           <article class="cut-card cut-card--ribeye" data-cut-id="ribeye" data-selected-cut-trigger="Ribeye">
263:             <img
264:               class="cut-card-image"
265:               src="${assetPath("assets/cuts/ribeye.png")}"
266:               alt=""
267:               aria-hidden="true"

---- lines 258-270 ----
258:             <h3>All Cuts</h3>
259:             <p class="cut-card-description">View the complete visual cut reference.</p>
260:           </article>
261: 
262:           <article class="cut-card cut-card--ribeye" data-cut-id="ribeye" data-selected-cut-trigger="Ribeye">
263:             <img
264:               class="cut-card-image"
265:               src="${assetPath("assets/cuts/ribeye.png")}"
266:               alt=""
267:               aria-hidden="true"
268:               loading="lazy"
269:             />
270:             <div class="cut-card-shade"></div>

---- lines 260-272 ----
260:           </article>
261: 
262:           <article class="cut-card cut-card--ribeye" data-cut-id="ribeye" data-selected-cut-trigger="Ribeye">
263:             <img
264:               class="cut-card-image"
265:               src="${assetPath("assets/cuts/ribeye.png")}"
266:               alt=""
267:               aria-hidden="true"
268:               loading="lazy"
269:             />
270:             <div class="cut-card-shade"></div>
271:             <p class="cut-card-description">Beef / Wagyu</p>
272:             <h3>Ribeye</h3>

---- lines 261-273 ----
261: 
262:           <article class="cut-card cut-card--ribeye" data-cut-id="ribeye" data-selected-cut-trigger="Ribeye">
263:             <img
264:               class="cut-card-image"
265:               src="${assetPath("assets/cuts/ribeye.png")}"
266:               alt=""
267:               aria-hidden="true"
268:               loading="lazy"
269:             />
270:             <div class="cut-card-shade"></div>
271:             <p class="cut-card-description">Beef / Wagyu</p>
272:             <h3>Ribeye</h3>
273:           </article>

---- lines 266-278 ----
266:               alt=""
267:               aria-hidden="true"
268:               loading="lazy"
269:             />
270:             <div class="cut-card-shade"></div>
271:             <p class="cut-card-description">Beef / Wagyu</p>
272:             <h3>Ribeye</h3>
273:           </article>
274: 
275:           <article class="cut-card cut-card--tenderloin" data-cut-id="tenderloin" data-selected-cut-trigger="Tenderloin">
276:             <img
277:               class="cut-card-image"
278:               src="${assetPath("assets/cuts/tenderloin.png")}"

---- lines 267-279 ----
267:               aria-hidden="true"
268:               loading="lazy"
269:             />
270:             <div class="cut-card-shade"></div>
271:             <p class="cut-card-description">Beef / Wagyu</p>
272:             <h3>Ribeye</h3>
273:           </article>
274: 
275:           <article class="cut-card cut-card--tenderloin" data-cut-id="tenderloin" data-selected-cut-trigger="Tenderloin">
276:             <img
277:               class="cut-card-image"
278:               src="${assetPath("assets/cuts/tenderloin.png")}"
279:               alt=""

---- lines 271-283 ----
271:             <p class="cut-card-description">Beef / Wagyu</p>
272:             <h3>Ribeye</h3>
273:           </article>
274: 
275:           <article class="cut-card cut-card--tenderloin" data-cut-id="tenderloin" data-selected-cut-trigger="Tenderloin">
276:             <img
277:               class="cut-card-image"
278:               src="${assetPath("assets/cuts/tenderloin.png")}"
279:               alt=""
280:               aria-hidden="true"
281:               loading="lazy"
282:             />
283:             <div class="cut-card-shade"></div>

---- lines 273-285 ----
273:           </article>
274: 
275:           <article class="cut-card cut-card--tenderloin" data-cut-id="tenderloin" data-selected-cut-trigger="Tenderloin">
276:             <img
277:               class="cut-card-image"
278:               src="${assetPath("assets/cuts/tenderloin.png")}"
279:               alt=""
280:               aria-hidden="true"
281:               loading="lazy"
282:             />
283:             <div class="cut-card-shade"></div>
284:             <p class="cut-card-description">Beef / Wagyu / Pork</p>
285:             <h3>Tenderloin</h3>

---- lines 274-286 ----
274: 
275:           <article class="cut-card cut-card--tenderloin" data-cut-id="tenderloin" data-selected-cut-trigger="Tenderloin">
276:             <img
277:               class="cut-card-image"
278:               src="${assetPath("assets/cuts/tenderloin.png")}"
279:               alt=""
280:               aria-hidden="true"
281:               loading="lazy"
282:             />
283:             <div class="cut-card-shade"></div>
284:             <p class="cut-card-description">Beef / Wagyu / Pork</p>
285:             <h3>Tenderloin</h3>
286:           </article>

---- lines 279-291 ----
279:               alt=""
280:               aria-hidden="true"
281:               loading="lazy"
282:             />
283:             <div class="cut-card-shade"></div>
284:             <p class="cut-card-description">Beef / Wagyu / Pork</p>
285:             <h3>Tenderloin</h3>
286:           </article>
287: 
288:           <article class="cut-card cut-card--striploin" data-cut-id="striploin" data-selected-cut-trigger="Striploin">
289:             <img
290:               class="cut-card-image"
291:               src="${assetPath("assets/cuts/striploin.png")}"

---- lines 280-292 ----
280:               aria-hidden="true"
281:               loading="lazy"
282:             />
283:             <div class="cut-card-shade"></div>
284:             <p class="cut-card-description">Beef / Wagyu / Pork</p>
285:             <h3>Tenderloin</h3>
286:           </article>
287: 
288:           <article class="cut-card cut-card--striploin" data-cut-id="striploin" data-selected-cut-trigger="Striploin">
289:             <img
290:               class="cut-card-image"
291:               src="${assetPath("assets/cuts/striploin.png")}"
292:               alt=""

---- lines 284-296 ----
284:             <p class="cut-card-description">Beef / Wagyu / Pork</p>
285:             <h3>Tenderloin</h3>
286:           </article>
287: 
288:           <article class="cut-card cut-card--striploin" data-cut-id="striploin" data-selected-cut-trigger="Striploin">
289:             <img
290:               class="cut-card-image"
291:               src="${assetPath("assets/cuts/striploin.png")}"
292:               alt=""
293:               aria-hidden="true"
294:               loading="lazy"
295:             />
296:             <div class="cut-card-shade"></div>

---- lines 286-298 ----
286:           </article>
287: 
288:           <article class="cut-card cut-card--striploin" data-cut-id="striploin" data-selected-cut-trigger="Striploin">
289:             <img
290:               class="cut-card-image"
291:               src="${assetPath("assets/cuts/striploin.png")}"
292:               alt=""
293:               aria-hidden="true"
294:               loading="lazy"
295:             />
296:             <div class="cut-card-shade"></div>
297:             <p class="cut-card-description">Beef / Wagyu</p>
298:             <h3>Striploin</h3>

---- lines 287-299 ----
287: 
288:           <article class="cut-card cut-card--striploin" data-cut-id="striploin" data-selected-cut-trigger="Striploin">
289:             <img
290:               class="cut-card-image"
291:               src="${assetPath("assets/cuts/striploin.png")}"
292:               alt=""
293:               aria-hidden="true"
294:               loading="lazy"
295:             />
296:             <div class="cut-card-shade"></div>
297:             <p class="cut-card-description">Beef / Wagyu</p>
298:             <h3>Striploin</h3>
299:           </article>

---- lines 292-304 ----
292:               alt=""
293:               aria-hidden="true"
294:               loading="lazy"
295:             />
296:             <div class="cut-card-shade"></div>
297:             <p class="cut-card-description">Beef / Wagyu</p>
298:             <h3>Striploin</h3>
299:           </article>
300: 
301:           <article class="cut-card cut-card--tomahawk" data-cut-id="tomahawk" data-selected-cut-trigger="Tomahawk">
302:             <img
303:               class="cut-card-image"
304:               src="${assetPath("assets/cuts/tomahawk.png")}"

---- lines 293-305 ----
293:               aria-hidden="true"
294:               loading="lazy"
295:             />
296:             <div class="cut-card-shade"></div>
```

## src/styles.css Modal/Image Context

```text
---- lines 1216-1244 ----
1216: 
1217: .provider-modal-brand-lip {
1218:   position: relative;
1219:   overflow: hidden;
1220:   min-height: clamp(72px, 8vw, 96px);
1221:   margin: clamp(20px, 2.6vw, 30px) 0 clamp(20px, 2.8vw, 34px);
1222:   border: 1px solid rgba(243, 240, 234, 0.14);
1223:   background: #0a0a0a;
1224: }
1225: 
1226: .provider-modal-brand-lip__image {
1227:   position: absolute;
1228:   inset: 0;
1229:   display: block;
1230:   width: 100%;
1231:   height: 100%;
1232:   object-fit: cover;
1233:   object-position: center;
1234:   opacity: 1;
1235:   filter: none;
1236:   transform: none;
1237: }
1238: 
1239: .provider-modal-brand-lip::before {
1240:   content: "";
1241:   position: absolute;
1242:   inset: 0;
1243:   z-index: 1;
1244:   background: none;

---- lines 1954-1982 ----
1954:   }
1955: 
1956:   .product-list-page-card figcaption {
1957:     padding: 8px 9px;
1958:     letter-spacing: 0.09em;
1959:     font-size: 0.56rem;
1960:   }
1961: }
1962: /* ALL_CUTS_PAGE_GALLERY_END */
1963: /* SELECTED_CUTS_MODAL_START */
1964: [data-selected-cut-trigger] {
1965:   cursor: pointer;
1966: }
1967: 
1968: [data-selected-cut-trigger]:focus-visible {
1969:   outline: 1px solid rgba(243, 240, 234, 0.72);
1970:   outline-offset: 8px;
1971: }
1972: 
1973: .selected-cut-modal {
1974:   width: min(700px, calc(100vw - 52px));
1975:   height: min(880px, calc(100vh - 56px));
1976:   max-width: 700px;
1977:   max-height: calc(100vh - 56px);
1978:   padding: 0;
1979:   overflow: hidden !important;
1980:   color: #f3f0ea;
1981:   background:
1982:     radial-gradient(circle at 74% 16%, rgba(243, 240, 234, 0.052), transparent 30%),

---- lines 1958-1986 ----
1958:     letter-spacing: 0.09em;
1959:     font-size: 0.56rem;
1960:   }
1961: }
1962: /* ALL_CUTS_PAGE_GALLERY_END */
1963: /* SELECTED_CUTS_MODAL_START */
1964: [data-selected-cut-trigger] {
1965:   cursor: pointer;
1966: }
1967: 
1968: [data-selected-cut-trigger]:focus-visible {
1969:   outline: 1px solid rgba(243, 240, 234, 0.72);
1970:   outline-offset: 8px;
1971: }
1972: 
1973: .selected-cut-modal {
1974:   width: min(700px, calc(100vw - 52px));
1975:   height: min(880px, calc(100vh - 56px));
1976:   max-width: 700px;
1977:   max-height: calc(100vh - 56px);
1978:   padding: 0;
1979:   overflow: hidden !important;
1980:   color: #f3f0ea;
1981:   background:
1982:     radial-gradient(circle at 74% 16%, rgba(243, 240, 234, 0.052), transparent 30%),
1983:     radial-gradient(circle at 20% 14%, rgba(243, 240, 234, 0.034), transparent 36%),
1984:     linear-gradient(180deg, rgba(13, 13, 13, 0.99), rgba(7, 7, 7, 0.995));
1985:   border: 1px solid rgba(243, 240, 234, 0.2);
1986:   border-radius: 28px;

---- lines 1963-1991 ----
1963: /* SELECTED_CUTS_MODAL_START */
1964: [data-selected-cut-trigger] {
1965:   cursor: pointer;
1966: }
1967: 
1968: [data-selected-cut-trigger]:focus-visible {
1969:   outline: 1px solid rgba(243, 240, 234, 0.72);
1970:   outline-offset: 8px;
1971: }
1972: 
1973: .selected-cut-modal {
1974:   width: min(700px, calc(100vw - 52px));
1975:   height: min(880px, calc(100vh - 56px));
1976:   max-width: 700px;
1977:   max-height: calc(100vh - 56px);
1978:   padding: 0;
1979:   overflow: hidden !important;
1980:   color: #f3f0ea;
1981:   background:
1982:     radial-gradient(circle at 74% 16%, rgba(243, 240, 234, 0.052), transparent 30%),
1983:     radial-gradient(circle at 20% 14%, rgba(243, 240, 234, 0.034), transparent 36%),
1984:     linear-gradient(180deg, rgba(13, 13, 13, 0.99), rgba(7, 7, 7, 0.995));
1985:   border: 1px solid rgba(243, 240, 234, 0.2);
1986:   border-radius: 28px;
1987:   box-shadow: 0 34px 100px rgba(0, 0, 0, 0.76);
1988:   backdrop-filter: blur(18px);
1989:   -webkit-backdrop-filter: blur(18px);
1990: }
1991: 

---- lines 1982-2010 ----
1982:     radial-gradient(circle at 74% 16%, rgba(243, 240, 234, 0.052), transparent 30%),
1983:     radial-gradient(circle at 20% 14%, rgba(243, 240, 234, 0.034), transparent 36%),
1984:     linear-gradient(180deg, rgba(13, 13, 13, 0.99), rgba(7, 7, 7, 0.995));
1985:   border: 1px solid rgba(243, 240, 234, 0.2);
1986:   border-radius: 28px;
1987:   box-shadow: 0 34px 100px rgba(0, 0, 0, 0.76);
1988:   backdrop-filter: blur(18px);
1989:   -webkit-backdrop-filter: blur(18px);
1990: }
1991: 
1992: .selected-cut-modal::backdrop {
1993:   background:
1994:     radial-gradient(circle at center, rgba(243, 240, 234, 0.065), transparent 44%),
1995:     rgba(0, 0, 0, 0.78);
1996:   backdrop-filter: blur(7px);
1997:   -webkit-backdrop-filter: blur(7px);
1998: }
1999: 
2000: .selected-cut-modal__panel {
2001:   position: relative;
2002:   height: 100%;
2003:   overflow: hidden;
2004:   overscroll-behavior: contain;
2005: }
2006: 
2007: .selected-cut-modal__close {
2008:   position: absolute;
2009:   top: clamp(18px, 2.4vw, 28px);
2010:   right: clamp(18px, 2.4vw, 28px);

---- lines 1990-2018 ----
1990: }
1991: 
1992: .selected-cut-modal::backdrop {
1993:   background:
1994:     radial-gradient(circle at center, rgba(243, 240, 234, 0.065), transparent 44%),
1995:     rgba(0, 0, 0, 0.78);
1996:   backdrop-filter: blur(7px);
1997:   -webkit-backdrop-filter: blur(7px);
1998: }
1999: 
2000: .selected-cut-modal__panel {
2001:   position: relative;
2002:   height: 100%;
2003:   overflow: hidden;
2004:   overscroll-behavior: contain;
2005: }
2006: 
2007: .selected-cut-modal__close {
2008:   position: absolute;
2009:   top: clamp(18px, 2.4vw, 28px);
2010:   right: clamp(18px, 2.4vw, 28px);
2011:   z-index: 3;
2012:   display: inline-grid;
2013:   width: 42px;
2014:   height: 42px;
2015:   place-items: center;
2016:   color: #f3f0ea;
2017:   background: rgba(8, 8, 8, 0.58);
2018:   border: 1px solid rgba(243, 240, 234, 0.24);

---- lines 1997-2025 ----
1997:   -webkit-backdrop-filter: blur(7px);
1998: }
1999: 
2000: .selected-cut-modal__panel {
2001:   position: relative;
2002:   height: 100%;
2003:   overflow: hidden;
2004:   overscroll-behavior: contain;
2005: }
2006: 
2007: .selected-cut-modal__close {
2008:   position: absolute;
2009:   top: clamp(18px, 2.4vw, 28px);
2010:   right: clamp(18px, 2.4vw, 28px);
2011:   z-index: 3;
2012:   display: inline-grid;
2013:   width: 42px;
2014:   height: 42px;
2015:   place-items: center;
2016:   color: #f3f0ea;
2017:   background: rgba(8, 8, 8, 0.58);
2018:   border: 1px solid rgba(243, 240, 234, 0.24);
2019:   border-radius: 999px;
2020:   cursor: pointer;
2021:   transition:
2022:     border-color 180ms ease,
2023:     background-color 180ms ease,
2024:     transform 180ms ease;
2025: }

---- lines 2017-2045 ----
2017:   background: rgba(8, 8, 8, 0.58);
2018:   border: 1px solid rgba(243, 240, 234, 0.24);
2019:   border-radius: 999px;
2020:   cursor: pointer;
2021:   transition:
2022:     border-color 180ms ease,
2023:     background-color 180ms ease,
2024:     transform 180ms ease;
2025: }
2026: 
2027: .selected-cut-modal__close:hover,
2028: .selected-cut-modal__close:focus-visible {
2029:   background: rgba(243, 240, 234, 0.08);
2030:   border-color: rgba(243, 240, 234, 0.52);
2031:   outline: none;
2032: }
2033: 
2034: .selected-cut-modal__close:active {
2035:   transform: scale(0.96);
2036: }
2037: 
2038: .selected-cut-modal__close span {
2039:   display: block;
2040:   margin-top: -2px;
2041:   font-size: 1.55rem;
2042:   line-height: 1;
2043: }
2044: 
2045: .selected-cut-modal__body {

---- lines 2018-2046 ----
2018:   border: 1px solid rgba(243, 240, 234, 0.24);
2019:   border-radius: 999px;
2020:   cursor: pointer;
2021:   transition:
2022:     border-color 180ms ease,
2023:     background-color 180ms ease,
2024:     transform 180ms ease;
2025: }
2026: 
2027: .selected-cut-modal__close:hover,
2028: .selected-cut-modal__close:focus-visible {
```

## Next Patch Rule

- Add image rendering to the selected cut modal without changing Section 4 card structure.
- Use the active cut ID to render assets/cuts/<cut-id>.png.
- Add or reuse CSS for a restrained modal image band.
- Verify every modal image exists before rendering.
- Delete iberico-loin.png only after the modal image fix passes and the file remains unreferenced.
