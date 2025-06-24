MINIFIER ?= minify
VARIANTS := md1 md2 md3
EXAMPLES := $(shell find doc/examples -type f -name '*.html')
SCREENSHOTS := $(patsubst %.html,%.png,$(notdir $(EXAMPLES)))

.PHONY: cleam all $(VARIANTS) combine screenshots 

all: $(VARIANTS) combine

clean:
	rm mm-*.min.css mm-*.min.js

$(VARIANTS):
	@echo " MINIFY ($(MINIFIER)) $@/*.css $@/*.js"
	@$(MINIFIER) --type=css -b $@/*.css -o mm-$@.min.css
	@$(MINIFIER) --type=js -b $@/*.js -o mm-$@.min.js

combine:
	@echo "COMBINE mm-*.min.css -> mm-all.min.css"
	@cat mm-*.min.css > mm-all.min.css
	@echo "COMBINE mm-*.min.js -> mm-all.min.js"
	@cat mm-*.min.js > mm-all.min.js

screenshots: $(SCREENSHOTS)

%.png: doc/examples/%.html
	@echo "SCRSHOT $< -> doc/images/$@"
	@chromium --headless --disable-gpu --window-size=1024x768 --screenshot=./doc/images/$@ file://$(PWD)/$< >/dev/null 2>&1