var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../base/slide_modals"], function (require, exports, slides) {
    "use strict";
    var tempFn = require("models/localization/templating");
    var questionTemp = tempFn("views/apps/templates/base/modal");
    var questionController = tempFn("views/apps/templates/quiz/quiz-controller");
    var questionItem = tempFn("views/apps/templates/quiz/question-item");
    var quizIntro = tempFn("views/apps/templates/quiz/quiz-intro");
    var quizOutro = tempFn("views/apps/templates/quiz/quiz-outro");
    var Question = (function (_super) {
        __extends(Question, _super);
        function Question() {
            _super.apply(this, arguments);
            this.isCorrect = false;
        }
        return Question;
    }(slides.KnockoutSlide));
    var Intro = (function (_super) {
        __extends(Intro, _super);
        function Intro() {
            _super.apply(this, arguments);
        }
        return Intro;
    }(slides.KnockoutSlide));
    var Outro = (function (_super) {
        __extends(Outro, _super);
        function Outro() {
            _super.apply(this, arguments);
        }
        Outro.prototype.setItem = function (data) {
            this.controlItems = data;
        };
        Outro.prototype.showResults = function () {
            var res = this.controlItems.map(function (e) {
                e.checkStatus();
                return e.isCorrect;
            });
            var nCorrect = res.filter(Boolean).length;
            var rescss = $(".progress-bar", this.el).css("width", ((nCorrect / res.length) * 100) + "%");
            console.log(rescss);
        };
        return Outro;
    }(slides.KnockoutSlide));
    var QuizQuestion = (function (_super) {
        __extends(QuizQuestion, _super);
        function QuizQuestion() {
            _super.apply(this, arguments);
        }
        QuizQuestion.prototype.checkStatus = function () {
            var newClass = this.isCorrect ? ["correct", "wrong"] : ["wrong", "correct"];
            this.dot.removeClass(newClass[1]).addClass(newClass[0]);
        };
        QuizQuestion.prototype.markSelection = function (self, evt) {
            var target = $(evt.target);
            $("li", this.container).removeClass("active");
            target.toggleClass("active");
            this.isCorrect = target.data("value") == this.data.qCorrectAns;
            console.log(target.val(), target, this.isCorrect, this.data.qCorrectAns);
        };
        return QuizQuestion;
    }(Question));
    var Quiz = (function (_super) {
        __extends(Quiz, _super);
        function Quiz(container, data) {
            _super.call(this, container, data);
            this.container = container;
            this.data = data;
            this.questions = data.qQuestions;
            var temp = $(questionController({}));
            this.container.html(temp);
            ko.applyBindings(this, this.container[0]);
            this.applyTooltips();
        }
        Quiz.prototype.startSession = function () {
            var _this = this;
            this.slides = this.questions.map(function (e, i) { return new QuizQuestion(_this.container, questionItem, e); });
            this.slides.unshift(new Intro(this.container, quizIntro, this.data));
            var outro = new Outro(this.container, quizOutro, this.data);
            var a = this.slides.slice(1);
            outro.setItem(a);
            this.slides.push(outro);
            this.insertSlides(questionTemp);
            this.blockUI();
        };
        return Quiz;
    }(slides.ModalApp));
    exports.Quiz = Quiz;
});
//# sourceMappingURL=quiz.js.map