/* ==========================================================================
   Inquiry boxes — SPEC section 5.

   No structured form. A name, an email, a message. Each box carries a
   suggested message appropriate to where it appears: shown greyed as the
   placeholder, and written into the textarea as real, editable text by a
   button beneath it. No tab key, no keyboard shortcut — the same gesture on
   mobile and desktop.

   Attaches itself to HB. Requires js/config.js for the endpoint.
   ========================================================================== */

(function () {
  "use strict";

  if (!window.HB) return;

  var el = HB.el;
  var seq = 0;

  /* --- Suggested messages ------------------------------------------------ */
  /* Templated per context, verbatim from SPEC section 5. */

  function suggestionFor(context) {
    var title = context.pieceTitle || "piece";

    switch (context.intent) {
      case "purchase":
        return (
          "Hi Hamza — I'm interested in the " +
          title +
          ". Is it still available, and what would shipping run?"
        );
      case "commission":
        return (
          "Hi Hamza — I know the " +
          title +
          " is sold, but I'd love something similar. Could you make one?"
        );
      case "custom":
        return "Hi Hamza — I'd like to commission a custom piece. Here's what I have in mind:";
      default:
        return "Hi Hamza — ";
    }
  }

  /* --- Validation -------------------------------------------------------- */
  /* Checked on submit. Errors say what went wrong and what to do — no raw
     error strings, no apology. Cleared as soon as the field is edited. */

  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validate(fields) {
    var errors = {};

    if (!fields.name.value.trim()) {
      errors.name = "Tell me your name, so I know who I'm writing back to.";
    }

    var email = fields.email.value.trim();
    if (!email) {
      errors.email = "I need an email address to reply to.";
    } else if (!EMAIL.test(email)) {
      errors.email = "That address looks incomplete. Check it and try again.";
    }

    if (!fields.message.value.trim()) {
      errors.message = "Tell me what you have in mind, in as much or as little detail as you like.";
    }

    return errors;
  }

  /* --- Building ---------------------------------------------------------- */

  function field(opts) {
    var id = "inq-" + opts.name + "-" + seq;
    var errorId = id + "-error";

    var wrap = el("div", "field");

    var label = el("label", "eyebrow", opts.label);
    label.htmlFor = id;

    var input =
      opts.name === "message"
        ? el("textarea", "field__input field__input--message")
        : el("input", "field__input");

    input.id = id;
    input.name = opts.name;
    if (opts.type) input.type = opts.type;
    if (opts.autocomplete) input.autocomplete = opts.autocomplete;
    if (opts.rows) input.rows = opts.rows;
    if (opts.placeholder) input.placeholder = opts.placeholder;

    var error = el("p", "field__error");
    error.id = errorId;
    error.hidden = true;

    wrap.appendChild(label);
    wrap.appendChild(input);
    wrap.appendChild(error);

    return { wrap: wrap, input: input, error: error, errorId: errorId };
  }

  function showError(part, message) {
    part.error.textContent = message;
    part.error.hidden = false;
    part.input.setAttribute("aria-invalid", "true");
    part.input.setAttribute("aria-describedby", part.errorId);
  }

  function clearError(part) {
    part.error.hidden = true;
    part.error.textContent = "";
    part.input.removeAttribute("aria-invalid");
    part.input.removeAttribute("aria-describedby");
  }

  /* context: { intent, pieceId, pieceTitle }
       intent — "purchase" | "commission" | "custom" | anything else (general)
     Returns the form element, ready to append.                              */

  function createInquiry(context) {
    context = context || {};
    seq += 1;

    var suggestion = suggestionFor(context);

    var form = el("form", "inquiry");
    form.noValidate = true;

    var name = field({ name: "name", label: "Name", type: "text", autocomplete: "name" });
    var email = field({ name: "email", label: "Email", type: "email", autocomplete: "email" });
    var message = field({
      name: "message",
      label: "Message",
      rows: 5,
      placeholder: suggestion
    });

    form.appendChild(name.wrap);
    form.appendChild(email.wrap);
    form.appendChild(message.wrap);

    /* Fills the textarea with the suggestion as real, editable text. Sits
       after the error so the error stays directly under the field it is
       about. */
    var suggest = el("button", "inquiry__suggest", "Use this message");
    suggest.type = "button";
    message.wrap.appendChild(suggest);

    suggest.addEventListener("click", function () {
      message.input.value = suggestion;
      clearError(message);
      message.input.focus();
      /* Cursor at the end, so the visitor carries on typing from there. */
      var end = message.input.value.length;
      message.input.setSelectionRange(end, end);
      suggest.hidden = true;
    });

    /* A gallery inquiry carries the piece with it, so Hamza is never guessing
       which one an email is about. */
    if (context.pieceTitle) {
      form.appendChild(hidden("piece", context.pieceTitle));
      form.appendChild(hidden("piece_id", context.pieceId || ""));
    }
    /* Tags the source so submissions are distinguishable in the inbox. */
    form.appendChild(hidden("source", context.source || "contact"));
    form.appendChild(
      hidden(
        "_subject",
        context.pieceTitle
          ? "Inquiry — " + context.pieceTitle
          : "Inquiry — Hamza's Blades"
      )
    );
    /* Formspree's honeypot. Bots fill it, people never see it. */
    var gotcha = hidden("_gotcha", "");
    gotcha.setAttribute("tabindex", "-1");
    gotcha.setAttribute("aria-hidden", "true");
    form.appendChild(gotcha);

    var submit = el("button", "btn btn--primary inquiry__submit", "Send inquiry");
    submit.type = "submit";
    form.appendChild(submit);

    /* Announced to screen readers when it changes. */
    var status = el("p", "inquiry__status");
    status.setAttribute("role", "status");
    form.appendChild(status);

    var parts = { name: name, email: email, message: message };

    /* Clear each error the moment its field is edited. */
    Object.keys(parts).forEach(function (key) {
      parts[key].input.addEventListener("input", function () {
        clearError(parts[key]);
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      onSubmit(form, parts, status, submit);
    });

    return form;
  }

  function hidden(name, value) {
    var input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    return input;
  }

  /* --- Submitting -------------------------------------------------------- */

  function onSubmit(form, parts, status, submit) {
    status.textContent = "";
    status.className = "inquiry__status";

    var fields = {
      name: parts.name.input,
      email: parts.email.input,
      message: parts.message.input
    };

    var errors = validate(fields);
    var keys = Object.keys(errors);

    /* The submit button is never disabled — it can be pressed, and it
       responds. Focus goes to the first field that needs attention. */
    if (keys.length) {
      Object.keys(parts).forEach(function (key) {
        if (errors[key]) showError(parts[key], errors[key]);
        else clearError(parts[key]);
      });
      parts[keys[0]].input.focus();
      return;
    }

    var endpoint = (window.HB_CONFIG || {}).FORM_ENDPOINT || "";

    if (!endpoint || endpoint.indexOf("YOUR_ID_HERE") !== -1) {
      /* Better to say so than to swallow a real inquiry silently. */
      console.warn(
        "Hamza's Blades: no Formspree endpoint set. Inquiries are not being " +
          "delivered. Set FORM_ENDPOINT in js/config.js."
      );
      fail(status, "This form isn't connected yet, so that didn't send. Try again shortly.");
      return;
    }

    submit.textContent = "Sending";
    status.textContent = "";

    fetch(endpoint, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new FormData(form)
    })
      .then(function (res) {
        if (!res.ok) throw new Error("rejected");
        succeed(form);
      })
      .catch(function () {
        submit.textContent = "Send inquiry";
        fail(
          status,
          "That didn't send — the connection dropped. Press send again and it should go through."
        );
      });
  }

  function fail(status, text) {
    status.textContent = text;
    status.className = "inquiry__status is-error";
  }

  /* Success replaces the form with a confirmation line in --brass. */
  function succeed(form) {
    var done = el("p", "inquiry__done");
    done.setAttribute("role", "status");
    done.textContent = "Sent. I'll write back from my own inbox — usually within a few days.";
    form.parentNode.replaceChild(done, form);
    done.setAttribute("tabindex", "-1");
    done.focus();
  }

  HB.createInquiry = createInquiry;
  HB.suggestionFor = suggestionFor;
})();
